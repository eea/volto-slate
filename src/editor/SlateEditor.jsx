import isHotkey from 'is-hotkey';
import cx from 'classnames';
import { createEditor, Transforms } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import React, { useState } from 'react';
import { connect } from 'react-redux';

import { Element, Leaf } from './render';
import { SlateToolbar } from './ui';
import { settings } from '~/config';

import withTestingFeatures from './extensions/withTestingFeatures';
// import { toggleMark } from './utils';

import './less/editor.less';

const SlateEditor = ({
  selected,
  value,
  onChange,
  data,
  placeholder,
  onKeyDown,
  properties,
  defaultSelection,
  extensions,
  testingEditorRef,
  ...props
}) => {
  const { slate } = settings;

  const [showToolbar, setShowToolbar] = useState(false);

  // the use of useRef here is very unusual. The code only works like this,
  // but if possible a better method should be used
  const paramExtensions = React.useRef(extensions || []);

  const defaultExtensions = slate.extensions;
  const editor = React.useMemo(() => {
    const raw = withHistory(withReact(createEditor()));

    // TODO: this needs cleanup
    const plugins = [
      // FIXME: commented out for testing reasons:
      // withDelete,
      // withBreakEmptyReset, // don't "clean" this up, it needs to stay here!
      ...paramExtensions.current,
      ...defaultExtensions,
    ];
    return plugins.reduce((acc, apply) => apply(acc), raw);
  }, [defaultExtensions]);

  const initial_selection = React.useRef();

  // Handles the case when block was just joined with backspace, in that
  // case we want to restore the cursor close to the initial position
  React.useLayoutEffect(() => {
    if (selected) {
      ReactEditor.focus(editor);

      if (defaultSelection) {
        if (initial_selection.current !== defaultSelection) {
          initial_selection.current = defaultSelection;
          Transforms.select(editor, defaultSelection);
        }
        return () => ReactEditor.blur(editor);
      }
    }
    return () => ReactEditor.blur(editor);
  }, [editor, selected, defaultSelection]);

  // Fixes a Slate bug with selection handling when the block has just been selected
  React.useEffect(() => {
    const sel = window.getSelection();

    // check for sel to be defined for the case of unit tests
    if (sel && selected && sel.type === 'None') {
      // in case this block was programatically created (by enter/backspace key)
      const el = ReactEditor.toDOMNode(editor, editor);
      sel.collapse(el, 0);
    }
  });

  const initialValue = slate.defaultValue();

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
      className={cx('slate-editor', { 'show-toolbar': showToolbar, selected })}
      {...props}
    >
      {/* {block} - {selected ? 'sel' : 'notsel'} */}
      <Slate editor={editor} value={value || initialValue} onChange={onChange}>
        <SlateToolbar
          selected={selected}
          showToolbar={showToolbar}
          setShowToolbar={setShowToolbar}
        />
        <Editable
          readOnly={!selected}
          placeholder={placeholder}
          renderElement={Element}
          renderLeaf={Leaf}
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
      </Slate>
    </div>
  );
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
