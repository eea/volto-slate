import { Editor, Transforms, Range, Node, Point, Text } from 'slate';
import { settings } from '~/config';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';

export function createEmptyListItem() {
  return {
    type: 'list-item',
    children: [{ text: '' }],
  };
}

export function insertEmptyListItem(editor) {
  // insert a new list item at the selection
  Transforms.insertNodes(editor, createEmptyListItem());
}

export function getCollapsedRangeAtBeginningOfEditor(editor) {
  return {
    anchor: { path: [], offset: 0 },
    focus: { path: [], offset: 0 },
  };
}

export function getCollapsedRangeAtEndOfSelection(editor) {
  return {
    anchor: Editor.end(editor, editor.selection),
    focus: Editor.end(editor, editor.selection),
  };
}

export function simulateBackspaceAtEndOfEditor(editor) {
  Transforms.delete(editor, {
    at: Editor.end(editor, []),
    distance: 1,
    unit: 'character',
    hanging: true,
    reverse: true,
  });
}

export function emptyListEntryAboveSelection(editor) {
  return (
    Editor.above(editor, {
      at: editor.selection,
      match: (x) => x.type === 'list-item',
    })[0].children[0].text === ''
  );
}

export const defaultListTypes = {
  typeUl: 'bulleted-list',
  typeOl: 'numbered-list',
  typeLi: 'list-item',
  typeP: 'paragraph',
};

export const isList = (options = defaultListTypes) => (n) =>
  [options.typeOl, options.typeUl].includes(n.type);

/**
 * Has the node an empty text
 * TODO: try Node.string
 */
export const isBlockTextEmpty = (node) => {
  const lastChild = node.children[node.children.length - 1];

  return Text.isText(lastChild) && !lastChild.text.length;
};

/**
 * Has the node an empty text
 * TODO: try Node.string
 */
// const isBlockTextEmpty = (node) => {
//   const lastChild = node.children[node.children.length - 1];
//
//   return Text.isText(lastChild) && !lastChild.text.length;
// };

export const matchParagraphWithSelection = (editor, { paragraphPath }) => {
  const start = Editor.start(editor, paragraphPath);
  const end = Editor.end(editor, paragraphPath);

  const isStart = Point.equals(editor.selection.anchor, start);
  const isEnd = Point.equals(editor.selection.anchor, end);

  return [isStart, isEnd];
};

// export function toggleBlock(editor, format, justSelection) {
//   const { slate } = settings;
//   const applyOnRange = () => {
//     return justSelection && editor.selection
//       ? editor.selection
//       : getMaxRange(editor);
//   };
//
//   const entry = getActiveEntry(editor, format);
//   let activeNodePath;
//   if (entry) {
//     [, activeNodePath] = entry;
//   }
//
//   const unwrappableBlockTypes = [
//     'block-quote',
//     'heading-two',
//     'heading-three',
//     ...slate.listTypes,
//   ];
//
//   if (unwrappableBlockTypes.includes(format)) {
//     console.log('entry', entry);
//     // TODO: ! code flow enters here, prints 'entry', but...
//     if (entry) {
//       // does not enter here, although entry is a truish value (an array with 2 non-null, defined elements)
//       console.log('is active, entry exists... unwrapping...');
//
//       Transforms.unwrapNodes(editor, {
//         at: activeNodePath,
//         split: true,
//         mode: 'all',
//       });
//     } else {
//       console.log('is not active, wrapping...');
//
//       const block = { type: format, children: [] };
//       Transforms.wrapNodes(editor, block, {
//         at: applyOnRange(),
//       });
//     }
//   } else {
//     // inlines and marks
//     Transforms.setNodes(
//       editor,
//       {
//         type: entry ? 'paragraph' : format,
//       },
//       { at: applyOnRange() },
//     );
//   }
// }
// export function blockEntryAboveSelection(editor) {
//   // the first node entry above the selection (towards the root) that is a block
//   return Editor.above(editor, {
//     match: (n) => {
//       console.log(n);
//       return Editor.isBlock(editor, n);
//     },
//   });
// }
//

// toggle list type
// preserves structure of list if going from a list type to another
export function toggleList(
  editor,
  {
    typeList,
    typeUl = 'bulleted-list',
    typeOl = 'numbered-list',
    typeLi = 'list-item',
    typeP = 'paragraph',
    isBulletedActive = false,
    isNumberedActive = false,
  },
) {
  // TODO: set previous selection (not this 'select all' command) after toggling list (in all three cases: toggling to numbered, bulleted or none)
  selectAll(editor);

  // const isActive = isNodeInSelection(editor, [typeList]);

  // if (the list type/s are unset) {

  const B = typeList === 'bulleted-list';
  const N = typeList === 'numbered-list';

  if (N && !isBulletedActive && !isNumberedActive) {
    convertAllToParagraph(editor);
    // go on with const willWrapAgain etc.
  } else if (N && !isBulletedActive && isNumberedActive) {
    convertAllToParagraph(editor);
    return;
  } else if (N && isBulletedActive && !isNumberedActive) {
    // go on with const willWrapAgain etc.
  } else if (B && !isBulletedActive && !isNumberedActive) {
    convertAllToParagraph(editor);
    // go on with const willWrapAgain etc.
  } else if (B && !isBulletedActive && isNumberedActive) {
    // go on with const willWrapAgain etc.
  } else if (B && isBulletedActive && !isNumberedActive) {
    convertAllToParagraph(editor);
    return;
  }

  selectAll(editor);

  const willWrapAgain = !isBulletedActive;
  unwrapList(editor, willWrapAgain, { unwrapFromList: isBulletedActive });

  const list = { type: typeList, children: [] };
  Transforms.wrapNodes(editor, list);

  const nodes = getSelectionNodesArrayByType(editor, typeP);

  const listItem = { type: typeLi, children: [] };

  for (const [, path] of nodes) {
    Transforms.wrapNodes(editor, listItem, {
      at: path,
    });
  }
}
