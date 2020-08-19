import cx from 'classnames';
import { createEditor, Transforms, Range } from 'slate';
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

  const selection = JSON.stringify(editor?.selection || {});
  const initial_selection = React.useRef();
  const [savedSelection, setSavedSelection] = React.useState();
  editor.setSavedSelection = setSavedSelection;
  editor.savedSelection = savedSelection;

  // This effect is useless since in the React.useLayoutEffect below we save the selection.
  // Update: it is still useful, w/o it the footnote edit form closes itself when receiving focus,
  // Why it is not a layout effect?
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
   * Could some of the cases listed above be avoided by using Transforms.select?
   */
  React.useLayoutEffect(() => {
    // The code in this if should be executed only when the control should be focused and is not (selected && !ReactEditor.isFocused(editor)? Should this code in this if be executed always when the editor is selected? What deps should it have and why?
    if (selected) {
      // With this focus call below, the DOM Selection is collapsed at the start of the block without known reason.
      // Without it, focusing the editor requires one click but the click's result is very accurate and nice. Is this focus call "too async" and breaks on its own the rest of the instructions below it?
      ReactEditor.focus(editor);

      // The DOM Selection here is existing, valid, and on offset 0, although it is wrong.
      console.log({
        editor_sel: JSON.parse(JSON.stringify(editor.selection)),
        dom_sel: window.getSelection(),
      });

      // the flow of the click that does not change the selection but sets the previous selection of the current Volto block does reach this point in code.

      // The if statement below is from the fixSelection from hacks.js
      // // This makes the Backspace key work properly in block.
      // // Don't remove it, unless this test passes:
      // // - with the Slate block unselected, click in the block.
      // // - Hit backspace. If it deletes, then the test passes.
      // the flow of the click that does not change the selection but sets the previous selection of the current Volto block does not enter this if branch below:
      if (!editor.selection) {
        const sel = window.getSelection();

        if (sel && sel.rangeCount > 0) {
          const s = ReactEditor.toSlateRange(editor, sel);
          // Maybe do a comparison of s with editor.selection through Range.equals
          // before giving a new reference to the editor.selection?
          editor.selection = s;
        }
      } // else {
      // here the old selection of the current Volto Slate Text block is in the editor.selection variable, we would change it but with what?
      // }
      // }
      // TODO: clear the previous timeout! otherwise, crashes happen.
      // I think that this timeout just postpones the wrong result.
      // setTimeout(() => {
      // // put here the fixSelection call and what's below uncommented:

      setSavedSelection(JSON.parse(JSON.stringify(editor.selection)));

      if (defaultSelection) {
        if (initial_selection.current !== defaultSelection) {
          initial_selection.current = defaultSelection;
          setTimeout(() => Transforms.select(editor, defaultSelection), 0);
        }
        // Not useful:
        // return () => ReactEditor.blur(editor);
      }
      // }, 1000);
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

  const j_value = JSON.stringify(value);
  const handleChange = React.useCallback(
    (newValue) => {
      if (JSON.stringify(newValue) !== j_value) {
        onChange(newValue);
      }
    },
    [j_value, onChange],
  );

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
          // Commented this out and the selection issue seems to be gone (Are there any regressions? maybe with the pink highlight of inactive selection? I do not know where to look for it.):
          // readOnly={!selected}
          placeholder={placeholder}
          renderElement={(props) => <Element {...props} />}
          renderLeaf={(props) => <Leaf {...props} />}
          decorate={multiDecorate}
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
