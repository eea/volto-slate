import { LISTTYPES } from '../constants';
import { isCursorAtBlockStart, isCursorAtBlockEnd } from '../../editor/utils';
import { Editor, Transforms, Range, Node, RangeRef, Path } from 'slate';
import { plaintext_serialize } from '../../editor/render';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import { unwrapList } from '../../editor/components/BlockButton.jsx';
export { onKeyDownList } from './listsKeyDownHandlers';

function getPreviousBlock(index, properties) {
  if (index === 0) return;

  // join this block with previous block, if previous block is slate
  const blocksFieldname = getBlocksFieldname(properties);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);

  const blocks_layout = properties[blocksLayoutFieldname];
  const prevBlockId = blocks_layout.items[index - 1];
  const prevBlock = properties[blocksFieldname][prevBlockId];
  return [prevBlock, prevBlockId];
}

function isCursorInList(editor) {
  const result = Editor.above(editor, {
    match: (n) => n.type === 'list-item',
  });

  if (!result) {
    return false;
  }

  const [listItemWithSelection, listItemWithSelectionPath] = result;

  // whether the selection is inside a list item
  const listItemCase =
    Range.isCollapsed(editor.selection) && listItemWithSelection;

  return listItemCase;
}

function handleBackspaceInList({
  editor,
  prevBlock,
  event,
  onFocusPreviousBlock,
  block,
  onDeleteBlock,
  blockNode,
}) {
  const [listNode, listNodePath] = Editor.above(editor, {
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


  const [listItemWithSelection, listItemWithSelectionPath] = Editor.above(
    editor,
    {
      match: (n) => n.type === 'list-item',
    },
  );

  // whether the selection is inside a list item
  const listItemCase =
    Range.isCollapsed(editor.selection) && listItemWithSelection;

  // if the selection is collapsed and at node and offset 0
  // or collapsed inside a list item
  if (isCursorAtBlockStart(editor) || listItemCase) {
    // are we in a list-item and is cursor at the beginning of the list item?
    if (listItemCase && editor.selection.anchor.offset === 0) {
      let [listNode, listNodePath] = Editor.parent(
        editor,
        listItemWithSelectionPath,
      );

      // the cursor is inside the first list-item
      if (listNode.children.indexOf(listItemWithSelection) === 0) {
        console.log('in the first list-item');
        event.stopPropagation();
        event.preventDefault();

        // let children = Node.children(editor, listNodePath);

        // let count = 0;
        // for (let [n, p] of children) {
        //   ++count;
        // }

        const count = listNode.children.length;

        if (count === 1) {
          Transforms.delete(editor);
          Editor.deleteBackward(editor, { unit: 'block' });
        }

        if (Node.string(listItemWithSelection) === '') {
          console.log('it is empty');
          // TODO: missing method:
          //appendCurrentBlockToPreviousBlock();
          onDeleteBlock(block, true);
          onFocusPreviousBlock(block, blockNode.current);
        } else if (editor.selection.anchor.offset !== 0) {
          console.log('not empty but the cursor at beginning');
          // Transforms.delete(editor, { unit: 'character', distance: 1 });
          Editor.deleteFragment(editor);
          Editor.deleteBackward(editor);
        }

        // A part from the backspace-in-text handling code for inspiration:
        // // setTimeout ensures setState has been successfully
        // // executed in Form.jsx. See
        // // https://github.com/plone/volto/issues/1519

        // setSlateBlockSelection(prevBlockId, selection);

        // setTimeout(() => {
        //   onChangeBlock(prevBlockId, {
        //     '@type': 'slate',
        //     value: combined,
        //     plaintext: plaintext_serialize(combined || []),
        //   });
        //   setTimeout(() => onDeleteBlock(block, true));
        // });

        return true; // TODO: join with previous <li> element, if exists
      }

      console.log('inside NOT in the first list item');
      // else handle by deleting the list-item
      // Transforms.delete(editor, { unit: 'block', distance: 1 });
      // Transforms.liftNodes(editor);
      // Transforms.mergeNodes(editor);
      // Transforms.mergeNodes(editor, { at: [1] });
      //console.log('editor.children', editor.children);

      // event.stopPropagation();
      // event.preventDefault();

      return false;
    }
  }
  return true;
}

function handleBackspaceInText(editor, prevBlock, event) {
  // To work around current architecture limitations, read the value
  // from previous block. Replace it in the current editor (over
  // which we have control), join with current block value, then use
  // this result for previous block, delete current block

  const prev = prevBlock.value;

  // collapse the selection to its start point
  Transforms.collapse(editor, { edge: 'start' });

  // TODO: do we really want to insert this text here?

  // insert a space before the left edge of the selection
  editor.apply({
    type: 'insert_text',
    path: [0, 0],
    offset: 0,
    text: ' ',
  });

  // collapse the selection to its start point
  Transforms.collapse(editor, { edge: 'start' });

  // insert the contents of the previous editor into the current editor
  Transforms.insertNodes(editor, prev, {
    at: Editor.start(editor, []),
  });

  // not needed currently: delete the useless space inserted above
  //Editor.deleteBackward(editor, { unit: 'character' });

  // merge the contents separated by the collapsed selection
  Transforms.mergeNodes(editor);
}

function blockIsEmpty(editor) {
  const value = editor.children;
  // TODO: this is very optimistic, we might have void nodes that are
  // meaningful. We should test if only one child, with empty text
  if (plaintext_serialize(value || []).length === 0) {
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
            plaintext: plaintext_serialize(combined || []),
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
      event.preventDefault();
      event.stopPropagation();

      // TODO: shouldn't collapse
      // Transforms.collapse(editor, { edge: 0 });

      // whether the cursor is inside a list-item
      const query = Editor.above(editor, {
        match: isNodeAList,
      });

      // if not inside a list-item, normal blur/focus behavior
      if (!query) {
        if (event.shiftKey) {
          onFocusPreviousBlock(block, blockNode.current);
        } else {
          onFocusNextBlock(block, blockNode.current);
        }
        return;
      }
      const [parent, path] = query;

      if (!event.shiftKey) {
        Transforms.wrapNodes(editor, {
          type: parent.type,
          children: [
            {
              type: 'list-item',
              children: [...Editor.fragment(editor, editor.selection)],
            },
          ],
        });
      } else {
        if (path.length >= 2) {
          // let [selStart, selEnd] = Range.edges(editor.selection);
          let selPath = [...Range.start(editor.selection).path];
          selPath.pop();

          let selOffset = Range.start(editor.selection).offset;

          // let rref = Editor.rangeRef(editor, editor.selection);
          Transforms.liftNodes(editor, {
            match: isNodeAList,
          });
          if (path.length === 2) {
            // TODO: make this code branch work with any number of list-item-s (currently only 2 work) and make test 9 more general for the same reason
            // let f1 = Editor.fragment(editor, [0]);
            // let f2 = Editor.fragment(editor, [1]);

            let fragments = [];
            let iterable = Node.children(editor, []);
            let count = 0;
            for (let _ of iterable) {
              fragments.push(Editor.fragment(editor, [count]));
              ++count;
            }

            console.log('fragments', fragments);

            let merged = [
              {
                type: parent.type,
                children: [],
              },
            ];

            for (let i = 0; i < count; ++i) {
              let children = [...fragments[i][0].children];
              console.log('children', children);
              merged[0].children.push(...children);
            }

            console.log('merged before removal', merged);
            for (let i = 0; i < count; ++i) {
              Transforms.removeNodes(editor, { at: [0] });
            }

            // console.log('editor.children', editor.children);
            console.log('merged', merged);
            Transforms.insertNodes(editor, merged, []);
            Transforms.select(editor, { path: selPath, offset: selOffset });
          }
        }
      }
    },
  };
};
