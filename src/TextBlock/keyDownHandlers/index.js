import { LISTTYPES } from 'volto-slate/constants';
import { isCursorAtBlockStart, isCursorAtBlockEnd } from 'volto-slate/utils';
import { Editor, Transforms, Range } from 'slate';
import { serializeNodesToText } from 'volto-slate/editor/render';
import { unwrapList } from 'volto-slate/utils.js';
export { onKeyDownList } from './listsKeyDownHandlers';

function handleBackspaceInList({
  editor,
  prevBlock,
  event,
  onFocusPreviousBlock,
  block,
  onDeleteBlock,
  blockNode,
}) {
  const [listNode] = Editor.above(editor, {
    match: (n) => n.type === 'bulleted-list' || n.type === 'numbered-list',
  });

  console.log('listNode.children.length', listNode.children.length);
  if (listNode && listNode.children.length === 1) {
    if (editor.selection.anchor.offset === 0) {
      unwrapList(editor, false);
      Transforms.select(editor, Editor.start(editor, []));

      event.stopPropagation();
      event.preventDefault();

      return true;
    }
  }

  Editor.deleteFragment(editor);
  Editor.deleteBackward(editor);
  return true;
}

// function handleBackspaceInText(editor, prevBlock, event) {
//   // To work around current architecture limitations, read the value
//   // from previous block. Replace it in the current editor (over
//   // which we have control), join with current block value, then use
//   // this result for previous block, delete current block
//
//   const prev = prevBlock.value;
//
//   // collapse the selection to its start point
//   Transforms.collapse(editor, { edge: 'start' });
//
//   // TODO: do we really want to insert this text here?
//
//   // insert a space before the left edge of the selection
//   editor.apply({
//     type: 'insert_text',
//     path: [0, 0],
//     offset: 0,
//     text: ' ',
//   });
//
//   // collapse the selection to its start point
//   Transforms.collapse(editor, { edge: 'start' });
//
//   // insert the contents of the previous editor into the current editor
//   Transforms.insertNodes(editor, prev, {
//     at: Editor.start(editor, []),
//   });
//
//   // not needed currently: delete the useless space inserted above
//   //Editor.deleteBackward(editor, { unit: 'character' });
//
//   // merge the contents separated by the collapsed selection
//   Transforms.mergeNodes(editor);
// }

function blockIsEmpty(editor) {
  const value = editor.children;
  // TODO: this is very optimistic, we might have void nodes that are
  // meaningful. We should test if only one child, with empty text
  if (serializeNodesToText(value || []).length === 0) {
    return true;
  }
}

export const getBackspaceKeyDownHandlers = ({
  onDeleteBlock,
  block,
  index,
  properties,
  setSlateBlockSelection,
  onChangeBlock,
  onFocusPreviousBlock,
  blockNode,
}) => {
  return {
    Backspace: ({ editor, event }) => {
      if (blockIsEmpty(editor)) {
        event.preventDefault();
        return onDeleteBlock(block, true);
      }

      const [prevBlock = {}, prevBlockId] = getPreviousBlock(index, properties);

      const isAtBlockStart = isCursorAtBlockStart(editor);

      if (!isAtBlockStart) return;

      event.stopPropagation();
      event.preventDefault();

      if (isCursorInList(editor)) {
        return handleBackspaceInList({
          editor,
          prevBlock,
          event,
          onFocusPreviousBlock,
          onDeleteBlock,
          block,
          blockNode,
        });
      } else {
        if (prevBlock['@type'] !== 'slate') return;

        handleBackspaceInText(editor, prevBlock);

        const selection = JSON.parse(JSON.stringify(editor.selection));
        const combined = JSON.parse(JSON.stringify(editor.children));

        // TODO: don't remove undo history, etc
        // TODO: after Enter, the current filled-with-previous-block
        // block is visible for a fraction of second

        // setTimeout ensures setState has been successfully
        // executed in Form.jsx. See
        // https://github.com/plone/volto/issues/1519

        setSlateBlockSelection(prevBlockId, selection);

        setTimeout(() => {
          onChangeBlock(prevBlockId, {
            '@type': 'slate',
            value: combined,
            plaintext: serializeNodesToText(combined || []),
          });
          setTimeout(() => onDeleteBlock(block, true));
        });
      }
    },
  };
};

const isNodeAList = (n) => {
  return LISTTYPES.includes(
    typeof n.type === 'undefined' ? n.type : n.type.toString(),
  );
};

export const getFocusRelatedKeyDownHandlers = ({
  block,
  blockNode,
  onFocusNextBlock,
  onFocusPreviousBlock,
}) => {
  return {
    ArrowUp: ({ editor, event }) => {
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

      // TODO: shouldn't collapse
      // Transforms.collapse(editor, { edge: 0 });

      // whether the cursor is inside a list-item
      const query = Editor.above(editor, {
        match: isNodeAList,
      });

      // if not inside a list-item, normal blur/focus behavior
      if (!query) {
        event.preventDefault();
        event.stopPropagation();

        if (event.shiftKey) {
          onFocusPreviousBlock(block, blockNode.current);
        } else {
          onFocusNextBlock(block, blockNode.current);
        }
        return;
      }

      const [itemNode, itemPath] = Editor.above(editor, {
        match: (n) => n.type === 'list-item',
      });

      // TODO: also treat nested lists
      if (itemNode && itemPath[itemPath.length - 1] !== 0) {
        event.preventDefault();
        event.stopPropagation();
        // other code does what is needed (to change indent level of selection)
        return;
      }
    },
  };
};
