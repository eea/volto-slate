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

// import isHotkey from 'is-hotkey';
// import { toggleMark } from './utils';

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
  ...rest
}) => {
  const { slate } = settings;

  const [showToolbar, setShowToolbar] = useState(false);
  // const [showPluginToolbar, setShowPluginToolbar] = useState(false);

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

  const selection = JSON.stringify(editor?.selection || {});
  const initial_selection = React.useRef();
  const [savedSelection, setSavedSelection] = React.useState();
  editor.setSavedSelection = setSavedSelection;
  editor.savedSelection = savedSelection;

  React.useEffect(() => {
    if (selected && selection && JSON.parse(selection).anchor) {
      setSavedSelection(JSON.parse(selection));
    }
  }, [selection, selected, editor]);

  /*
   * We 'restore' the selection because we manipulate it in several cases:
   * - when blocks are artificially joined, we set the selection at junction
   * - when moving up, we set it at end of previous blok
   * - when moving down, we set it at beginning of next block
   */
  React.useLayoutEffect(() => {
    if (selected) {
      ReactEditor.focus(editor);

      // This makes the Backspace key work properly in block.
      // Don't remove it, unless this test passes:
      // - with the Slate block unselected, click in the block.
      // - Hit backspace. If it deletes, then the test passes
      fixSelection(editor);
      setSavedSelection(JSON.parse(JSON.stringify(editor.selection)));

      if (defaultSelection) {
        if (initial_selection.current !== defaultSelection) {
          initial_selection.current = defaultSelection;
          setTimeout(() => Transforms.select(editor, defaultSelection), 0);
        }
        return () => ReactEditor.blur(editor);
      }
    }
    return () => ReactEditor.blur(editor);
  }, [editor, selected, defaultSelection]);

  const initialValue = slate.defaultValue();

  // Decorations (such as higlighting node types, selection, etc).
  const { runtimeDecorators = [] } = slate;

  const multiDecorate = React.useCallback(
    ([node, path]) => {
      return runtimeDecorators.reduce(
        (acc, deco) => deco([node, path], acc),
        [],
      );
    },
    [runtimeDecorators],
  );

  if (testingEditorRef) {
    testingEditorRef.current = editor;
  }

  return (
    <div
      {...rest['debug-values']} // used for `data-` HTML attributes set in the withTestingFeatures HOC
      className={cx('slate-editor', { 'show-toolbar': showToolbar, selected })}
    >
      <Slate editor={editor} value={value || initialValue} onChange={onChange}>
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
          onKeyDown={(event) => {
            // let wasHotkey = false;
            //
            // for (const hotkey in slate.hotkeys) {
            //   if (isHotkey(hotkey, event)) {
            //     event.preventDefault();
            //     const mark = slate.hotkeys[hotkey];
            //     toggleMark(editor, mark);
            //     wasHotkey = true;
            //   }
            // }
            //
            // if (wasHotkey) {
            //   return;
            // }

            onKeyDown && onKeyDown({ editor, event });
          }}
        />
        {/* <div>{savedSelection}</div> */}
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
