import isHotkey from 'is-hotkey';
import cx from 'classnames';
import { createEditor, Transforms } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import React, { useCallback, useState, Fragment } from 'react';
import { connect } from 'react-redux';

import { Element, Leaf } from '../render';
import Toolbar from './Toolbar';
import ExpandedToolbar from './ExpandedToolbar';
import { toggleMark } from '../utils';
import { createDefaultFragment } from '../../TextBlock/utils';
import { settings } from '~/config';

const SlateEditor = ({
  selected,
  value,
  onChange,
  data,
  placeholder,
  onKeyDown,
  properties,
  decorators,
  // block,
  defaultSelection,
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [currentSelection, setCurrentSelection] = useState(null);

  let expandedToolbarButtons = settings?.slate?.expandedToolbarButtons;
  let toolbarButtons = settings?.slate?.toolbarButtons;
  let availableButtons = settings?.slate?.availableButtons;

  const renderElement = useCallback((props) => {
    return <Element {...props} />;
  }, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const { slate } = settings;

  // wrap editor with new functionality. While Slate calls them plugins, we
  // use decorator to avoid confusion. A Volto Slate editor plugins adds more
  // functionality: buttons, new elements, etc.
  // (editor) => editor
  //
  // Each decorator is a simple mutator function with signature: editor =>
  // editor. See https://docs.slatejs.org/concepts/07-plugins and // https://docs.slatejs.org/concepts/06-editor

  const paramdecos = React.useRef(decorators || []);

  const editor = React.useMemo(() => {
    const raw = withHistory(withReact(createEditor()));

    const decos = [
      // FIXME: commented out for testing reasons:
      // withDelete,
      // withBreakEmptyReset, // don't "clean" this up, it needs to stay here!
      ...(slate?.decorators || []),
      ...paramdecos.current,
    ];
    return decos.reduce((acc, apply) => apply(acc), raw);
  }, [slate?.decorators]);

  const initial_selection = React.useRef();

  React.useLayoutEffect(() => {
    if (selected) {
      ReactEditor.focus(editor);

      if (defaultSelection) {
        // Handles the case when block was just joined with backspace, in that
        // case we want to restore the cursor close to the initial position
        if (initial_selection.current !== defaultSelection) {
          initial_selection.current = defaultSelection;
          Transforms.select(editor, defaultSelection);
        }
        return () => ReactEditor.blur(editor);
      }
      // TODO: rewrite this with Slate api
      // BUG: this causes the selection of the other block to become null when clicking on the second block, simply commenting this out makes the test pass, but with what price?
      // TODO: step into: it is clear it is a bad hack (manual change to editor.selection is bad):
      // fixSelection(editor);
    }
    return () => ReactEditor.blur(editor);
  }, [editor, selected, defaultSelection]);

  React.useEffect(() => {
    const sel = window.getSelection();

    // check for sel to be defined for the case of unit tests
    if (sel && selected && sel.type === 'None') {
      // in case this block was programatically created (by enter/backspace key)
      const el = ReactEditor.toDOMNode(editor, editor);
      sel.collapse(el, 0);
    }
  });

  const initialValue = createDefaultFragment();

  // Source: https://stackoverflow.com/a/53623568/258462
  const onTestSelectWord = (val) => {
    let slateEditor =
      val.detail.parentElement.parentElement.parentElement.parentElement;

    // Events are special, can't use spread or Object.keys
    let selectEvent = {};
    for (let key in val) {
      if (key === 'currentTarget') {
        selectEvent['currentTarget'] = slateEditor;
      } else if (key === 'type') {
        selectEvent['type'] = 'select';
      } else {
        selectEvent[key] = val[key];
      }
    }

    // Make selection
    let selection = window.getSelection();
    let range = document.createRange();
    range.selectNodeContents(val.detail);
    selection.removeAllRanges();
    selection.addRange(range);

    // Slate monitors DOM selection changes automatically
  };

  React.useEffect(() => {
    document.addEventListener('Test_SelectWord', onTestSelectWord);

    return () => {
      document.removeEventListener('Test_SelectWord', onTestSelectWord);
    };
  });

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
        {!showToolbar && (
          <Toolbar
            onToggle={() => setShowToolbar(!showToolbar)}
            mainToolbarShown={showToolbar}
          >
            {toolbarButtons?.map((name, i) => (
              <Fragment key={`${name}-${i}`}>
                {availableButtons[name]()}
              </Fragment>
            ))}
          </Toolbar>
        )}
        <div
          className={cx('toolbar-wrapper', { active: showToolbar && selected })}
        >
          {selected && showToolbar && (
            <ExpandedToolbar
              onToggle={() => setShowToolbar(!showToolbar)}
              mainToolbarShown={showToolbar}
            >
              {expandedToolbarButtons?.map((name, i) => (
                <Fragment key={`${name}-${i}`}>
                  {availableButtons[name]()}
                </Fragment>
              ))}
            </ExpandedToolbar>
          )}
        </div>
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
})(SlateEditor);
