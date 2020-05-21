import isHotkey from 'is-hotkey';
import cx from 'classnames';
import { createEditor } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import React, { useMemo, useCallback, useState, Fragment } from 'react';

import { Element, Leaf } from '../render';
import Toolbar from './Toolbar';
import ExpandedToolbar from './ExpandedToolbar';
import { toggleMark } from '../utils';
import { settings } from '~/config';
import { Editor, Transforms, Range, Point } from 'slate';

const withDelete = (editor) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;
    // console.log('selection', selection);

    if (selection && Range.isCollapsed(selection)) {
      // console.log('second case');
      const match = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          Transforms.setNodes(editor, { type: 'paragraph' });

          if (block.type === 'list-item') {
            Transforms.unwrapNodes(editor, {
              match: (n) => n.type === 'bulleted-list',
              split: true,
            });
          }

          return;
        }
      }
      deleteBackward(...args);
    } else {
      console.log('delete', args);
      deleteBackward(1);
    }
  };

  return editor;
};

const SlateEditor = ({
  selected,
  value,
  onChange,
  data,
  block,
  useExpandToolbar,
  placeholder,
  onKeyDown,
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
  //
  // Each decorator is a simple
  // mutator function with signature: editor => editor
  // See https://docs.slatejs.org/concepts/07-plugins and
  // https://docs.slatejs.org/concepts/06-editor
  //
  //
  const editor = useMemo(
    () =>
      (slate.decorators || []).reduce(
        (acc, apply) => apply(acc),
        withDelete(withHistory(withReact(createEditor()))),
      ),
    [slate.decorators],
  );
  React.useLayoutEffect(() => {
    if (selected) {
      ReactEditor.focus(editor);

      const sel = window.getSelection();
      sel.collapse(
        sel.focusNode,
        sel.anchorOffset > 0 ? sel.anchorOffset - 1 : 0,
      );
      sel.collapse(
        sel.focusNode,
        sel.anchorOffset > 0 ? sel.anchorOffset + 1 : 0,
      );
      // }, 100);
    }
    return () => ReactEditor.blur(editor);
  }, [editor, selected, block]);

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
      <Slate editor={editor} value={value || initialValue} onChange={onChange}>
        {!showToolbar && (
          <Toolbar
            onToggle={() => setShowToolbar(!showToolbar)}
            mainToolbarShown={showToolbar}
            showMasterToggleButton={useExpandToolbar}
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
              showMasterToggleButton={useExpandToolbar}
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
        {/* block */}
        <Editable
          readOnly={!selected}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder={placeholder}
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
