import cx from 'classnames';
import { isEqual } from 'lodash';
// import throttle from 'lodash/throttle';
import { createEditor, Transforms } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { Range } from 'slate';
import { withHistory } from 'slate-history';
import React, { useState } from 'react';
import { connect } from 'react-redux';

import { Element, Leaf } from './render';
import { SlateToolbar, SlateContextToolbar } from './ui';
import { settings } from '~/config';

import withTestingFeatures from './extensions/withTestingFeatures';
import { fixSelection, hasRangeSelection } from 'volto-slate/utils';

import isHotkey from 'is-hotkey';
import { toggleMark } from 'volto-slate/utils';
import { useIsomorphicLayoutEffect } from 'volto-slate/hooks';

import './less/editor.less';

const SlateEditor = ({
  selected,
  value,
  onChange,
  placeholder,
  onKeyDown,
  properties,
  defaultSelection, // TODO: use useSelector
  extensions,
  renderExtensions = [],
  testingEditorRef,
  onFocus,
  onBlur,
  ...rest
}) => {
  const { slate } = settings;

  const [showToolbar, setShowToolbar] = useState(false);

  const defaultExtensions = slate.extensions;
  let editor = React.useMemo(() => {
    const raw = withHistory(withReact(createEditor()));
    const plugins = [...defaultExtensions, ...extensions];
    return plugins.reduce((acc, apply) => apply(acc), raw);
  }, [defaultExtensions, extensions]);

  // renderExtensions is needed because the editor is memoized, so if these
  // extensions need an updated state (for example to insert updated
  // blockProps) then we need to always wrap the editor with them
  editor = renderExtensions.reduce((acc, apply) => apply(acc), editor);

  // Save a copy of the selection in the editor. Sometimes the editor loses its
  // selection (because it is tied to DOM events). For example, if I'm in the
  // editor and I open a popup dialog with text inputs, the Slate editor loses
  // its selection, but I want to keep that selection because my operations
  // should apply to it).

  const initial_selection = React.useRef();
  const [savedSelection, setSavedSelection] = React.useState();
  editor.setSavedSelection = setSavedSelection;
  editor.savedSelection = savedSelection;

  const timeoutRef = React.useRef(null);
  const onDOMSelectionChange = React.useCallback(
    (evt) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        const { activeElement } = window.document;
        const el = ReactEditor.toDOMNode(editor, editor);
        if (activeElement !== el) return;

        if (!ReactEditor.isFocused(editor)) {
          console.log('focusing editor');
          ReactEditor.focus(editor);
        }

        if (
          defaultSelection &&
          initial_selection.current !== defaultSelection
        ) {
          initial_selection.current = defaultSelection;
          fixSelection(editor, evt, defaultSelection); // If you plan on removing this, test thoroughly!
        } else {
          fixSelection(editor, evt);
        }
        // }

        // Save the selection, available as editor.savedSelection
        if (
          editor.selection &&
          editor.selection.anchor &&
          !isEqual(editor.selection, savedSelection)
        ) {
          // if (!Range.isBackward(editor.selection))
          // TODO: saving selection is weird on backward motion, it "jumps"
          setSavedSelection(editor.selection);
        }
        // }
      }, 100);
    },
    [editor, savedSelection, defaultSelection], //selected,
  );

  /*
   * We 'restore' the selection because we manipulate it in several cases:
   * - when blocks are artificially joined, we set the selection at junction
   * - when moving up, we set it at end of previous blok
   * - when moving down, we set it at beginning of next block
   */
  useIsomorphicLayoutEffect(() => {
    if (selected) {
      ReactEditor.focus(editor);
      window.document.addEventListener('selectionchange', onDOMSelectionChange);
    }

    return () => {
      window.document.removeEventListener(
        'selectionchange',
        onDOMSelectionChange,
      );
    };
  }, [onDOMSelectionChange, editor, selected, defaultSelection]);

  const initialValue = slate.defaultValue();

  // Decorations (such as higlighting node types, selection, etc).
  const { runtimeDecorators = [] } = slate;

  const multiDecorate = React.useCallback(
    ([node, path]) => {
      return runtimeDecorators.reduce(
        (acc, deco) => deco(editor, [node, path], acc),
        [],
      );
    },
    [editor, runtimeDecorators],
  );

  if (testingEditorRef) {
    testingEditorRef.current = editor;
  }

  const j_value = JSON.stringify(value);
  const handleChange = React.useCallback(
    (newValue) => {
      if (JSON.stringify(newValue) !== j_value) {
        onChange(newValue);
      }
    },
    [j_value, onChange],
  );
  // readOnly={!selected}

  return (
    <div
      {...rest['debug-values']} // used for `data-` HTML attributes set in the withTestingFeatures HOC
      className={cx('slate-editor', { 'show-toolbar': showToolbar, selected })}
    >
      <Slate
        editor={editor}
        value={value || initialValue}
        onChange={handleChange}
      >
        {selected ? (
          hasRangeSelection(editor) ? (
            <SlateToolbar
              selected={selected}
              showToolbar={showToolbar}
              setShowToolbar={setShowToolbar}
            />
          ) : (
            <SlateContextToolbar
              editor={editor}
              plugins={slate.contextToolbarButtons}
            />
          )
        ) : (
          ''
        )}
        <Editable
          readOnly={false}
          placeholder={placeholder}
          renderElement={(props) => <Element {...props} />}
          renderLeaf={(props) => <Leaf {...props} />}
          decorate={multiDecorate}
          spellCheck={false}
          onFocus={onFocus}
          onBlur={() => {
            console.log('i got blurred');
          }}
          onKeyDown={(event) => {
            let wasHotkey = false;

            for (const hotkey in slate.hotkeys) {
              if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = slate.hotkeys[hotkey];
                toggleMark(editor, mark);
                wasHotkey = true;
              }
            }

            if (wasHotkey) {
              return;
            }

            onKeyDown && onKeyDown({ editor, event });
          }}
          {...rest}
        />
        {selected &&
          slate.persistentHelpers.map((Helper, i) => {
            return <Helper key={i} />;
          })}
        <ul>
          <li>{selected ? 'selected' : 'no-selected'}</li>
          <li>defaultSelection: {JSON.stringify(defaultSelection)}</li>
          <li>savedSelection: {JSON.stringify(savedSelection)}</li>
          <li>live selection: {JSON.stringify(editor.selection)}</li>
          <li>children: {JSON.stringify(editor.children)}</li>
        </ul>
      </Slate>
    </div>
  );
};

SlateEditor.defaultProps = {
  extensions: [],
};

export default connect((state, props) => {
  const blockId = props.block;
  return {
    defaultSelection: state.slate_block_selections?.[blockId],
  };
})(
  __CLIENT__ && window?.Cypress
    ? withTestingFeatures(SlateEditor)
    : SlateEditor,
);
