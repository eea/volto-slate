import isHotkey from 'is-hotkey';
import cx from 'classnames';
import { createEditor, Transforms } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import React, { useCallback, useState, Fragment } from 'react';

import { Element, Leaf } from '../render';
import Toolbar from './Toolbar';
import ExpandedToolbar from './ExpandedToolbar';
import {
  fixSelection,
  toggleMark,
  withDelete,
  breakEmptyReset,
} from '../utils';
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
  block,
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const {
    expandedToolbarButtons,
    toolbarButtons,
    availableButtons,
  } = settings.slate;

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
    const withBreakEmptyReset = breakEmptyReset({
      types: ['bulleted-list', 'numbered-list'],
      typeP: 'paragraph',
    });
    const decos = [
      // FIXME: commented out for testing reasons:
      // withDelete,
      // withBreakEmptyReset, // don't "clean" this up, it needs to stay here!
      ...(slate.decorators || []),
      ...paramdecos.current,
    ];
    return decos.reduce((acc, apply) => apply(acc), raw);
  }, [slate.decorators]);

  const initial_selection = React.useRef();
  const { selection } = data;

  React.useLayoutEffect(() => {
    if (selected) {
      ReactEditor.focus(editor);

      if (selection) {
        // Handles the case when block was just joined with backspace, in that
        // case we want to restore the cursor close to the initial position
        if (initial_selection.current !== selection) {
          initial_selection.current = selection;
          Transforms.select(editor, selection);
        }
        return () => ReactEditor.blur(editor);
      }
      // TODO: rewrite this with Slate api
      fixSelection(editor);
    }
    return () => ReactEditor.blur(editor);
  }, [editor, selected, block, selection]);

  React.useEffect(() => {
    const sel = window.getSelection();
    if (selected && sel.type === 'None') {
      // in case this block was programatically created (by enter/backspace key)
      const el = ReactEditor.toDOMNode(editor, editor);
      sel.collapse(el, 0);
    }
  });

  const initialValue = [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];

  return (
    <div
      className={cx('slate-editor', { 'show-toolbar': showToolbar, selected })}
    >
      {/* {block} - {selected ? 'sel' : 'notsel'} */}
      <Slate editor={editor} value={value || initialValue} onChange={onChange}>
        {!showToolbar && (
          <Toolbar
            onToggle={() => setShowToolbar(!showToolbar)}
            mainToolbarShown={showToolbar}
          >
            {toolbarButtons.map((name, i) => (
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
              {expandedToolbarButtons.map((name, i) => (
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

export default SlateEditor;
