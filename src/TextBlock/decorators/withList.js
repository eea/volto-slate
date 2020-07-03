import { Editor, Path, Point, Range, Transforms, Text, Node } from 'slate';
import { settings } from '~/config';
import {
  simulateBackspaceAtEndOfEditor,
  createAndSelectNewSlateBlock,
  splitEditorInTwoFragments,
  replaceAllContentInEditorWith,
} from 'volto-slate/utils';
import { splitEditorInTwoLists } from '../../utils';

const isPointAtRoot = (point) => point.path.length === 2;

const isRangeAtRoot = (range) =>
  isPointAtRoot(range.anchor) || isPointAtRoot(range.focus);

/**
 * Has the node an empty text
 * TODO: try Node.string
 */
const isBlockTextEmpty = (node) => {
  const lastChild = node.children[node.children.length - 1];

  return Text.isText(lastChild) && !lastChild.text.length;
};

const thereIsNoListItemBelowSelection = (editor) => {
  let sel = editor.selection;
  if (Range.isExpanded(sel)) {
    Transforms.collapse(editor, { edge: 'start' });
  }
  // path of paragraph (TODO: what if there is no paragraph, but a nested list?)
  let pg = Path.parent(sel.anchor.path);
  // Path of list-item
  let p = Path.parent(pg);
  // Path of numbered/bulleted list
  let pp = Path.parent(p);

  let listItems = Node.children(editor, pp);

  for (let [, path] of listItems) {
    if (Path.isAfter(path, p)) {
      return false;
    }
  }

  return true;
};

const insertNewListItem = (
  editor,
  { typeLi = 'list-item', typeP = 'paragraph', at, select = false },
) => {
  Transforms.insertNodes(
    editor,
    {
      type: typeLi,
      children: [{ type: typeP, children: [{ text: '' }] }],
    },
    { at: at },
  );
  if (select) {
    Transforms.select(editor, at);
  }
};

const handleBreakInListItem = (
  editor,
  {
    paragraphPath,
    paragraphNode,
    listItemPath,
    listItemNode,
    typeLi = 'list-item',
    typeP = 'paragraph',
    createAndSelectNewBlockAfter,
  },
) => {
  // if selection is expanded, delete it
  if (Range.isExpanded(editor.selection)) {
    Transforms.delete(editor);
  }

  const start = Editor.start(editor, paragraphPath);
  const end = Editor.end(editor, paragraphPath);

  const isStart = Point.equals(editor.selection.anchor, start);
  const isEnd = Point.equals(editor.selection.anchor, end);

  /**
   * If cursor on start of paragraph, if the paragraph is empty, remove the paragraph (and the list item), then break the block!
   * if it is not empty, insert a new empty list item.
   */
  if (isStart) {
    if (isBlockTextEmpty(paragraphNode)) {
      if (thereIsNoListItemBelowSelection(editor)) {
        simulateBackspaceAtEndOfEditor(editor);
        const bottomBlockValue = settings.slate.defaultValue();
        createAndSelectNewBlockAfter(bottomBlockValue);
      } else {
        let [upBlock, bottomBlock] = splitEditorInTwoLists(
          editor,
          listItemPath,
        );
        replaceAllContentInEditorWith(editor, upBlock);
        createAndSelectNewBlockAfter(bottomBlock);
      }
      return;
    } else {
      insertNewListItem(editor, {
        at: listItemPath,
      });
    }
  }

  const nextParagraphPath = Path.next(paragraphPath);
  const nextListItemPath = Path.next(listItemPath);
  /**
   * If not end, split nodes, wrap a list item on the new paragraph and move it to the next list item
   */
  if (!isEnd) {
    Transforms.splitNodes(editor, { at: editor.selection });

    // this condition is necessary to avoid a not understood bug
    if (Node.has(editor, nextParagraphPath)) {
      Transforms.wrapNodes(
        editor,
        {
          type: typeLi,
          children: [{ text: '' }],
        },
        { at: nextParagraphPath },
      );
      Transforms.moveNodes(editor, {
        at: nextParagraphPath,
        to: nextListItemPath,
      });
    }
  } else {
    if (!isBlockTextEmpty(paragraphNode)) {
      insertNewListItem(editor, {
        at: nextListItemPath,
        select: true,
      });
    }
  }

  /**
   * If there is a list in the list item, move it to the next list item
   */
  if (listItemNode.children.length > 1) {
    Transforms.moveNodes(editor, {
      at: nextParagraphPath,
      to: nextListItemPath.concat(1),
    });
  }
};

const withList = ({
  typeLi = 'list-item',
  typeP = 'paragraph',
  onChangeBlock,
  onAddBlock,
  onSelectBlock,
  index,
} = {}) => (editor) => {
  const { insertBreak } = editor;

  const createAndSelectNewBlockAfter = (blockValue) => {
    return createAndSelectNewSlateBlock(blockValue, index, {
      onChangeBlock,
      onAddBlock,
      onSelectBlock,
    });
  };

  /**
   * Add a new list item if selection is in a LIST_ITEM > typeP.
   */
  editor.insertBreak = () => {
    // if there is a selection that touches the root
    if (editor.selection && !isRangeAtRoot(editor.selection)) {
      const [paragraphNode, paragraphPath] = Editor.parent(
        editor,
        editor.selection,
      );
      // if the selection is inside a paragraph
      if (paragraphNode.type === typeP) {
        const listItemEntry = Editor.parent(editor, paragraphPath);
        const [listItemNode, listItemPath] = listItemEntry;

        // if the paragraph is inside a list item
        if (listItemEntry && listItemNode.type === typeLi) {
          handleBreakInListItem(editor, {
            createAndSelectNewBlockAfter,
            listItemNode,
            listItemPath,
            paragraphNode,
            paragraphPath,
            typeLi,
            typeP,
          });
          return;
        }
      }
    } else if (editor.selection && isRangeAtRoot(editor.selection)) {
      const paragraphEntry = Editor.parent(editor, editor.selection);

      if (paragraphEntry) {
        const [upBlock, bottomBlock] = splitEditorInTwoFragments(editor);
        replaceAllContentInEditorWith(editor, upBlock);
        createAndSelectNewBlockAfter(bottomBlock);
      }
      return;
    }

    insertBreak();
  };

  return editor;
};

export default withList;
