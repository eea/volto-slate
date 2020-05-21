import React, { useMemo } from 'react';
import { Range, Node, Editor } from 'slate';
import SlateEditor from './../editor';
import { getDOMSelectionInfo } from './../editor/utils';
import { plaintext_serialize } from './../editor/render';
import { settings } from '~/config';
import { SidebarPortal } from '@plone/volto/components';
import ShortcutListing from './ShortcutListing';

const TextBlockEdit = (props) => {
  const {
    data,
    selected,
    block,
    onChangeBlock,
    onFocusPreviousBlock,
    onFocusNextBlock,
    blockNode,
  } = props;

  const { value } = data;

  const keyDownHandlers = useMemo(() => {
    return {
      ArrowUp: ({ editor, event, selection }) => {
        if (Range.isCollapsed(editor.selection)) {
          if (
            !editor.selection.anchor.path ||
            editor.selection.anchor.path[0] === 0
          ) {
            if (editor.selection.anchor.offset === 0) {
              onFocusPreviousBlock(block, blockNode.current);
            }
          }
        }
      },

      ArrowDown: ({ editor, event, selection }) => {
        //const end = Editor.end(editor, editor.children);

        // daca suntem pe ultimul block
        // daca suntem pe ultimul copil din block
        // daca suntem la capatul selectiei din acel block
        if (Range.isCollapsed(editor.selection)) {
          const anchor = editor.selection?.anchor || {};

          // the last node in the editor
          let n = Node.last(editor, []);

          if (
            Node.get(editor, anchor.path) === n[0] &&
            anchor.offset === n[0].text.length
          ) {
            onFocusNextBlock(block, blockNode.current);
          }
        }
      },

      Backspace: ({ editor, event, selection, onDeleteBlock, id, data }) => {
        console.log('backspace event');
        const { start, end } = selection;
        const { value } = data;

        if (start === end && start === 0) {
          if (plaintext_serialize(value || []).length === 0) {
            event.preventDefault();
            return onDeleteBlock(id, true);
          }
        }
        return true;
      },

      Enter: ({ event }) => {
        // event.preventDefault();
        event.stopPropagation();
        return true;
      },

      ...settings.slate?.keyDownHandlers,
    };
  }, [block, blockNode, onFocusPreviousBlock, onFocusNextBlock]);

  return (
    <>
      <SidebarPortal selected={selected}>
        <div id="slate-plugin-sidebar"></div>
        <ShortcutListing />
      </SidebarPortal>
      <SlateEditor
        value={value}
        data={data}
        block={block}
        onChange={(value) => {
          onChangeBlock(block, {
            ...data,
            value,
            plaintext: plaintext_serialize(value || []),
          });
        }}
        onKeyDown={({ editor, event }) => {
          keyDownHandlers[event.key] &&
            keyDownHandlers[event.key]({
              ...props,
              editor,
              event,
              selection: getDOMSelectionInfo(),
            });
        }}
        selected={selected}
        placeholder="Enter some rich text…"
      />
    </>
  );
};

export default TextBlockEdit;
