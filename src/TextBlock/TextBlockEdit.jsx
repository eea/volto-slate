import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import React, { useMemo } from 'react';
import { Editor, Transforms, Range, Node, Point } from 'slate';
import SlateEditor from './../editor';
import {
  fixSelection,
  isCursorAtBlockEnd,
  isCursorAtBlockStart,
} from './../editor/utils';
import { plaintext_serialize } from './../editor/render';
import { settings } from '~/config';
import { SidebarPortal } from '@plone/volto/components';
import ShortcutListing from './ShortcutListing';

const LISTTYPES = ['bulleted-list', 'numbered-list'];

const TextBlockEdit = (props) => {
  const {
    data,
    selected,
    block,
    onAddBlock,
    onChangeBlock,
    onDeleteBlock,
    onFocusNextBlock,
    onFocusPreviousBlock,
    onSelectBlock,
    blockNode,
    index,
    properties,
  } = props;

  const { value } = data;

  // TODO: convert these handlers to editor decorations
  const keyDownHandlers = useMemo(() => {
    return {
      ArrowUp: ({ editor, even }) => {
        if (isCursorAtBlockStart(editor))
          onFocusPreviousBlock(block, blockNode.current);
      },

      ArrowDown: ({ editor, event }) => {
        if (isCursorAtBlockEnd(editor))
          onFocusNextBlock(block, blockNode.current);
      },

      Tab: ({ editor, event }) => {
        /* Intended behavior:
         *
         * <tab> at beginning of block, go to next block
         * <tab> at end of block, go to next block
         * <tab> at beginning of block in a list, go to next block
         *
         * <s-tab> at beginning of block, go to prev block
         * <s-tab> at end of block, go to prev block
         * <s-tab> at beginning of block in a list, go to prev block
         *
         * <tab> at beginning of line in a list, not at beginning of block:
         * wrap in a new list (make a sublist). Compare with previous indent
         * level?
         * <s-tab> at beginning of line in a list, not at beginning of block:
         * If in a sublist, unwrap from the list (decrease indent level)
         *
         */
        event.preventDefault();
        event.stopPropagation();

        // TODO: shouldn't collapse
        Transforms.collapse(editor, { edge: 0 });

        const query = Editor.above(editor, {
          match: (n) =>
            LISTTYPES.includes(
              typeof n.type === 'undefined' ? n.type : n.type.toString(),
            ),
        });

        if (!query) {
          if (event.shiftKey) {
            onFocusPreviousBlock(block, blockNode.current);
          } else {
            onFocusNextBlock(block, blockNode.current);
          }
          return;
        }
        const [parent] = query;

        if (!event.shiftKey) {
          Transforms.wrapNodes(editor, { type: parent.type, children: [] });
        } else {
          Transforms.unwrapNodes(editor, {
            // TODO: is this only for first node encountered?
            match: (n) =>
              LISTTYPES.includes(
                typeof n.type === 'undefined' ? n.type : n.type.toString(),
              ),
          });
        }
      },

      Backspace: ({ editor, event }) => {
        const { value } = data;

        // if the selection is collapsed and at node and offset 0
        if (
          Range.isCollapsed(editor.selection) &&
          Point.equals(editor.selection.anchor, Editor.start(editor, []))
        ) {
          // TODO: this is very optimistic, we might have void nodes that are
          // meaningful. We should test if only one child, with empty text

          if (plaintext_serialize(value || []).length === 0) {
            event.preventDefault();
            return onDeleteBlock(block, true);
          }

          // Are we in a listing block? Handle by deleting empty list item
          const query = Editor.above(editor, {
            match: (n) =>
              LISTTYPES.includes(
                typeof n.type === 'undefined' ? n.type : n.type.toString(),
              ),
          });

          const match = Editor.above(editor, {
            match: (n) => Editor.isBlock(editor, n),
          });
          if (match && Node.string(match[0])) {
            // We're in a list item. Is it the first list item?
            return; // TODO: join with previous <li> element, if exists
          }

          // if (query) {
          //   Editor.deleteBackward(editor, { unit: 'line' });
          //   console.log(editor.children);
          //   return;
          // }

          event.stopPropagation();
          event.preventDefault();

          // join this block with previous block, if previous block is slate
          const blocksFieldname = getBlocksFieldname(properties);
          const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);

          const blocks_layout = properties[blocksLayoutFieldname];
          const prevBlockId = blocks_layout.items[index - 1];
          const prevBlock = properties[blocksFieldname][prevBlockId];

          if (prevBlock['@type'] !== 'slate') {
            return;
          }

          // To work around current architecture limitations, read the value
          // from previous block. Replace it in the current editor (over
          // which we have control), join with current block value, then use
          // this result for previous block, delete current block

          event.stopPropagation();
          event.preventDefault();

          const prev = prevBlock.value;

          Transforms.collapse(editor, { edge: 'start' });

          // TODO: do we really want to insert this text here?
          editor.apply({
            type: 'insert_text',
            path: [0, 0],
            offset: 0,
            text: ' ',
          });
          Transforms.collapse(editor, { edge: 'start' });
          Transforms.insertNodes(editor, prev, { at: [0] });
          Transforms.mergeNodes(editor);

          const selection = JSON.parse(JSON.stringify(editor.selection));
          const combined = JSON.parse(JSON.stringify(editor.children));

          // TODO: don't remove undo history, etc

          // setTimeout is needed to ensure setState has been successfully
          // executed in Form.jsx. See
          // https://github.com/plone/volto/issues/1519
          setTimeout(() => {
            onChangeBlock(prevBlockId, {
              '@type': 'slate',
              value: combined,
              selection,
              // TODO: set plaintext field value in block value
            });
            setTimeout(() => onDeleteBlock(block, true));
          });
        }
        return true;
      },

      ...settings.slate?.keyDownHandlers,
    };
  }, [
    block,
    blockNode,
    data,
    index,
    onChangeBlock,
    onDeleteBlock,
    onFocusNextBlock,
    onFocusPreviousBlock,
    properties,
  ]);

  const withHandleBreak = React.useCallback(
    (editor) => {
      const { insertBreak } = editor;
      const empty = {
        type: 'paragraph',
        children: [{ text: '' }],
      };

      editor.insertBreak = () => {
        const currentNodeEntry = Editor.above(editor, {
          match: (n) => Editor.isBlock(editor, n),
        });

        if (currentNodeEntry) {
          // TODO: check if node is list type, need to handle differently
          const [currentNode, path] = currentNodeEntry;

          const parent = Editor.above(editor, {
            match: (n) =>
              LISTTYPES.includes(
                typeof n.type === 'undefined' ? n.type : n.type.toString(),
              ),
          });

          if (parent) {
            Transforms.insertNodes(editor, {
              type: 'list-item',
              children: [{ text: '' }],
            });

            return;
          }

          Transforms.splitNodes(editor);
          const [head, tail] = editor.children.slice(path);
          const id = onAddBlock('slate', index + 1);
          onChangeBlock(id, {
            '@type': 'slate',
            value: [JSON.parse(JSON.stringify(tail || empty))],
          }); // TODO: set plaintext field value in block value

          if (tail) Transforms.removeNodes(editor);
          onSelectBlock(id);

          return;
        }

        insertBreak();
      };

      return editor;
    },
    [index, onAddBlock, onChangeBlock, onSelectBlock],
  );

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
        decorators={[withHandleBreak]}
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
            });
        }}
        selected={selected}
        placeholder="Enter some rich text…"
      />
    </>
  );
};

export default TextBlockEdit;
