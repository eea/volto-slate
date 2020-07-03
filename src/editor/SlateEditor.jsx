import isHotkey from 'is-hotkey';
import cx from 'classnames';
import { createEditor, Transforms } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';

import { Element, Leaf } from './render';
import { SlateToolbar } from './ui';
import { toggleMark } from './utils';
import { settings } from '~/config';

import withTestingFeatures from './withTestingFeatures';

import './less/editor.less';

const SlateEditor = ({
  selected,
  value,
  onChange,
  data,
  placeholder,
  onKeyDown,
  properties,
  decorators,
  defaultSelection,
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [currentSelection, setCurrentSelection] = useState(null);

  const { slate } = settings;

  const renderElement = useCallback((props) => {
    return <Element {...props} />;
  }, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const paramdecos = React.useRef(decorators || []);

  const defaultDecorators = slate.decorators;
  const editor = React.useMemo(() => {
    const raw = withHistory(withReact(createEditor()));

    // TODO: this needs cleanup
    const decos = [
      // FIXME: commented out for testing reasons:
      // withDelete,
      // withBreakEmptyReset, // don't "clean" this up, it needs to stay here!
      ...paramdecos.current,
      ...defaultDecorators,
    ];
    return decos.reduce((acc, apply) => apply(acc), raw);
  }, [defaultDecorators]);

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

  // TODO: make this, data-slate-value, etc, a HOC
  // remove after solving the issue with null selection
  const handleChange = (...args) => {
    setCurrentSelection(editor.selection);
    return onChange(...args, editor.selection);
  };

  return (
    <div
      data-slate-value={window?.Cypress ? JSON.stringify(value, null, 2) : null}
      data-slate-selection={
        window?.Cypress ? JSON.stringify(currentSelection, null, 2) : null
      }
      className={cx('slate-editor', { 'show-toolbar': showToolbar, selected })}
    >
      {/* {block} - {selected ? 'sel' : 'notsel'} */}
      <Slate
        editor={editor}
        value={value || initialValue}
        onChange={handleChange}
      >
        <SlateToolbar
          selected={selected}
          showToolbar={showToolbar}
          setShowToolbar={setShowToolbar}
        />
        <Editable
          readOnly={!selected}
          placeholder={placeholder}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
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
  !__SERVER__ && window?.Cypress
    ? withTestingFeatures(SlateEditor)
    : SlateEditor,
);
