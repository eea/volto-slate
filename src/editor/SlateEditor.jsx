import cx from 'classnames';
import { createEditor, Transforms } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
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
  onFocusCapture,
  onBlurCapture,
  ...rest
}) => {
  const { slate } = settings;

  const [showToolbar, setShowToolbar] = useState(false);

  const raw = React.useMemo(() => {
    return withHistory(withReact(createEditor()));
  }, []);

  const defaultExtensions = slate.extensions;

  const bareEditor = React.useMemo(() => {
    const plugins = [...defaultExtensions, ...extensions];
    return plugins.reduce((acc, apply) => apply(acc), raw);
  }, [defaultExtensions, extensions, raw]);

  // renderExtensions is needed because the editor is memoized, so if these
  // extensions need an updated state (for example to insert updated
  // blockProps) then we need to always wrap the editor with them
  const editor = React.useMemo(() => {
    return renderExtensions.reduce((acc, apply) => apply(acc), bareEditor);
  }, [bareEditor, renderExtensions]);

  // Save a copy of the selection in the editor. Sometimes the editor loses its
  // selection (because it is tied to DOM events). For example, if I'm in the
  // editor and I open a popup dialog with text inputs, the Slate editor loses
  // its selection, but I want to keep that selection because my operations
  // should apply to it).

  // This seems useless:
  // const initial_selection = React.useRef();

  // We need to rerender on selection change so we make it a state.
  // The value of a new saved selection is available just after a rerender.
  const [
    savedSelection,
    setSavedSelection,
  ] = React.useState(/* {
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 0, path: [0, 0] },
  } */);
  React.useLayoutEffect(() => {
    editor.savedSelection = savedSelection;
  }, [editor, savedSelection]);
  React.useLayoutEffect(() => {
    editor.setSavedSelection = setSavedSelection;
  }, [editor]);
  /*
   * We 'restore' the selection because we manipulate it in several cases:
   * - when blocks are artificially joined, we set the selection at junction
   * - when moving up, we set it at end of previous blok
   * - when moving down, we set it at beginning of next block
   * Could some of the cases listed above be avoided by using Transforms.select?
   */
  React.useLayoutEffect(() => {
    // The code in this if should be executed only when the control should be focused and is not (selected && !ReactEditor.isFocused(editor)? Should this code in this if be executed always when the editor is selected? What deps should it have and why?
    if (selected) {
      // console.log('selected prop true and focusing editor');
      ReactEditor.focus(editor);

      // The if statement below is from the fixSelection from hacks.js but with some necessary modifications.
      // // This makes the Backspace key work properly in block.
      // // Don't remove it, unless this test passes:
      // // - with the Slate block unselected, click in the block.
      // // - Hit backspace. If it deletes, then the test passes.
      // Use the second condition (isFocused(editor)) to make sure we
      // are setting the selection on the correct editor. Otherwise we
      // get error at clicking on another cell in a table when the previously
      // focused cell had its selection larger than the contents of the
      // newly focused cell so an error is thrown.
      if (!editor.selection && ReactEditor.isFocused(editor)) {
        const sel = window.getSelection();

        if (sel && sel.rangeCount > 0) {
          let s;
          // We are using this try-catch to avoid https://github.com/ianstormtaylor/slate/issues/3834.
          try {
            s = ReactEditor.toSlateRange(editor, sel);
          } catch (ex) {
            s = null;
          }
          // Maybe do a comparison of s with editor.selection through Range.equals
          // before giving a new reference to the editor.selection?
          editor.selection = s;
        }
      }

      // This call would cause rerendering from layout effect hook which I think it is wrong but it also causes React error: "Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.". Also, this is done, I think, above, in the React.useEffect call.
      // editor.setSavedSelection(JSON.parse(JSON.stringify(editor.selection)));

      // TODO: this seems useless and breaks other things:
      // if (defaultSelection) {
      //   if (initial_selection.current !== defaultSelection) {
      //     initial_selection.current = defaultSelection;
      //     setTimeout(() => Transforms.select(editor, defaultSelection), 0);
      //   }
      //   // Not useful:
      //   // return () => ReactEditor.blur(editor);
      // }
    }
    // Not useful:
    // return () => ReactEditor.blur(editor);
  }, [editor, selected, defaultSelection]);

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

  // This useMemo is just an optimization.
  const j_value = React.useMemo(() => {
    return JSON.stringify(value);
  }, [value]);
  const handleChange = React.useCallback(
    (newValue) => {
      if (selected && editor.selection && editor.selection.anchor) {
        editor.setSavedSelection(editor.selection);
      }
      if (JSON.stringify(newValue) !== j_value) {
        onChange(newValue);
      }
    },
    [editor, j_value, onChange, selected],
  );

  // console.log('--------------------------------');
  // console.log('Rendering SlateEditor, selected =', selected);

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
          readOnly={!selected}
          placeholder={placeholder}
          renderElement={(props) => <Element {...props} />}
          renderLeaf={(props) => <Leaf {...props} />}
          decorate={multiDecorate}
          // TODO: maybe in future set spellCheck to true
          spellCheck={false}
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
          onFocus={onFocus}
          onBlur={onBlur}
          onFocusCapture={onFocusCapture}
          onBlurCapture={onBlurCapture}
        />
        {slate.persistentHelpers.map((Helper, i) => {
          return <Helper key={i} />;
        })}
        {/* <div>{JSON.stringify(savedSelection)}</div> */}
        {/* <div>{JSON.stringify(editor.selection)}</div> */}
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
