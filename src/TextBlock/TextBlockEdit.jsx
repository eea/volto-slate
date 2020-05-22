import React, { useMemo } from 'react';
import { Range, Node } from 'slate';
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
    onAddBlock,
    onSelectBlock,
    blockNode,
    index,
    properties,
  } = props;

  console.log('props', props);

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

      Tab: ({ editor, event, selection }) => {
        event.preventDefault();
        event.stopPropagation();

        if (event.shiftKey) {
          onFocusPreviousBlock(block, blockNode.current);
        } else {
          onFocusNextBlock(block, blockNode.current);
        }
      },

      ArrowDown: ({ editor, event, selection }) => {
        if (Range.isCollapsed(editor.selection)) {
          const anchor = editor.selection?.anchor || {};

          // the last node in the editor
          const n = Node.last(editor, []);

          if (
            Node.get(editor, anchor.path) === n[0] &&
            anchor.offset === n[0].text.length
          ) {
            onFocusNextBlock(block, blockNode.current);
          }
        }
      },

      Backspace: ({ editor, event, selection, onDeleteBlock, id, data }) => {
        const { start, end } = selection;
        const { value } = data;

        if (start === end && start === 0) {
          // dc selectia e colapsata
          // - pune blocul curent la sf blcului anterior (concat arrays)
          //    - verifica daca bocul anterior este compatibil (properties?)
          //    - get the previous block as a variable (properties)
          //    - find the method that sets that block's value (onChangeBlock)
          //    - find the method that gets that block's value (properties)
          //    - this block's value is `value`/`data`
          // - sterge blocul curent (facut mai jos)

          // - bugul rezolva fals: onAddBlock prop

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

  //const { slate } = settings;
  const deco = (editor) => editor;

  return (
    <>
      <SidebarPortal selected={selected}>
        <div id="slate-plugin-sidebar"></div>
        <ShortcutListing />
      </SidebarPortal>
      <SlateEditor
        index={index}
        properties={properties}
        onAddBlock={onAddBlock}
        decorators={[deco]}
        onSelectBlock={onSelectBlock}
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
