import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import React, { useMemo } from 'react';
import { Editor, Transforms, Range, Node } from 'slate';
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

  const { value } = data;

  // TODO: convert these handlers to editor decorations
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
        if (Range.isCollapsed(editor.selection)) {
          const anchor = editor.selection?.anchor || {};

          // the last node in the editor
          const [n] = Node.last(editor, []);

          if (
            Node.get(editor, anchor.path) === n &&
            anchor.offset === n.text.length
          ) {
            onFocusNextBlock(block, blockNode.current);
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

      Backspace: ({ editor, event, selection, onDeleteBlock, id, data }) => {
        const { start, end } = selection;
        const { value } = data;

        if (start === end && start === 0) {
          if (plaintext_serialize(value || []).length === 0) {
            event.preventDefault();
            return onDeleteBlock(id, true);
          } else {
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

            Transforms.collapse(editor, { edge: start });
            editor.apply({
              type: 'insert_text',
              path: [0, 0],
              offset: 0,
              text: ' ',
            });
            Transforms.collapse(editor, { edge: start });
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
              setTimeout(() => onDeleteBlock(block, true), 0);
            }, 0);
          }
        }
        return true;
      },

      ...settings.slate?.keyDownHandlers,
    };
  }, [
    block,
    blockNode,
    onFocusPreviousBlock,
    onChangeBlock,
    onFocusNextBlock,
    index,
    properties,
  ]);

  const deco = React.useCallback(
    (editor) => {
      const { insertBreak } = editor;
      const empty = {
        type: 'paragraph',
        children: [{ text: '' }],
      };

      editor.insertBreak = () => {
        const listTypes = ['bulleted-list', 'numbered-list'];

        const currentNodeEntry = Editor.above(editor, {
          match: (n) => Editor.isBlock(editor, n),
        });

        if (currentNodeEntry) {
          // TODO: check if node is list type, need to handle differently
          const [currentNode, path] = currentNodeEntry;

          const parent = Editor.above(editor, {
            match: (n) =>
              listTypes.includes(
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
