import React from 'react';
import { useSlate } from 'slate-react';

import {
  getActiveEntry,
  toggleBlock,
  getMaxRange,
  isNodeInSelection,
  getSelectionNodesByType,
} from '../utils';
import ToolbarButton from './ToolbarButton';

import { Editor, Transforms, Node, Text, Range, Point, Path } from 'slate';

// TODO: put all these functions into an utils.js file

const unwrapNodesByType = (editor, types, options = {}) => {
  Transforms.unwrapNodes(editor, {
    match: (n) => types.includes(n.type),
    ...options,
  });
};

export const selectAll = (editor) => {
  Transforms.select(editor, getMaxRange(editor));
};

// var matchPath = (editor, path) => {
//   var [node] = Editor.node(editor, path);
//   return (n) => n === node;
// };

// let insertNodes = (editor, nodes, options = {}) => {
//   Editor.withoutNormalizing(editor, () => {
//     const { hanging = false, voids = false, mode = 'lowest' } = options;
//     let { at, match, select } = options;

//     if (Node.isNode(nodes)) {
//       nodes = [nodes];
//     }

//     if (nodes.length === 0) {
//       return;
//     }

//     const [node] = nodes;

//     // By default, use the selection as the target location. But if there is
//     // no selection, insert at the end of the document since that is such a
//     // common use case when inserting from a non-selected state.
//     if (!at) {
//       if (editor.selection) {
//         at = editor.selection;
//       } else if (editor.children.length > 0) {
//         at = Editor.end(editor, []);
//       } else {
//         at = [0];
//       }

//       select = true;
//     }

//     if (select == null) {
//       select = false;
//     }

//     if (Range.isRange(at)) {
//       if (!hanging) {
//         at = Editor.unhangRange(editor, at);
//       }

//       if (Range.isCollapsed(at)) {
//         at = at.anchor;
//       } else {
//         const [, end] = Range.edges(at);
//         const pointRef = Editor.pointRef(editor, end);
//         Transforms.delete(editor, { at });
//         at = pointRef.unref();
//       }
//     }

//     if (Point.isPoint(at)) {
//       if (match == null) {
//         if (Text.isText(node)) {
//           match = (n) => Text.isText(n);
//         } else if (editor.isInline(node)) {
//           match = (n) => Text.isText(n) || Editor.isInline(editor, n);
//         } else {
//           match = (n) => Editor.isBlock(editor, n);
//         }
//       }

//       const [entry] = Editor.nodes(editor, {
//         at: at.path,
//         match,
//         mode,
//         voids,
//       });

//       if (entry) {
//         const [, matchPath] = entry;
//         const pathRef = Editor.pathRef(editor, matchPath);
//         const isAtEnd = Editor.isEnd(editor, at, matchPath);
//         Transforms.splitNodes(editor, { at, match, mode, voids });
//         const path = pathRef.unref();
//         at = isAtEnd ? Path.next(path) : path;
//       } else {
//         return;
//       }
//     }

//     const parentPath = Path.parent(at);
//     let index = at[at.length - 1];

//     if (!voids && Editor.void(editor, { at: parentPath })) {
//       return;
//     }

//     for (const node of nodes) {
//       const path = parentPath.concat(index);
//       index++;
//       editor.apply({ type: 'insert_node', path, node });
//     }

//     if (select) {
//       const point = Editor.end(editor, at);

//       if (point) {
//         Transforms.select(editor, point);
//       }
//     }
//   });
// };

// let removeNodes = (editor, ...args) => {
//   var options = args.length > 0 && args[0] !== undefined ? args[0] : {};
//   Editor.withoutNormalizing(editor, () => {
//     var { hanging = false, voids = false, mode = 'lowest' } = options;
//     var { at = editor.selection, match } = options;

//     if (!at) {
//       return;
//     }

//     if (match == null) {
//       match = Path.isPath(at)
//         ? matchPath(editor, at)
//         : (n) => Editor.isBlock(editor, n);
//     }

//     if (!hanging && Range.isRange(at)) {
//       at = Editor.unhangRange(editor, at);
//     }

//     var depths = Editor.nodes(editor, {
//       at,
//       match,
//       mode,
//       voids,
//     });
//     var pathRefs = Array.from(depths, (_ref4) => {
//       var [, p] = _ref4;
//       return Editor.pathRef(editor, p);
//     });

//     for (var pathRef of pathRefs) {
//       var path = pathRef.unref();

//       if (path) {
//         var [node] = Editor.node(editor, path);
//         editor.apply({
//           type: 'remove_node',
//           path,
//           node,
//         });
//       }
//     }

//     // insertNodes(editor, { text: '' }, { at: Editor.start(editor, [0]) });
//   });
// };

export const convertAllToParagraph = (editor) => {
  let recursive = (myNode) => {
    if (Text.isText(myNode)) return [{ ...myNode }];

    let output = [];
    let children = Node.children(myNode, []);
    // let count = Array.from(children).length;

    for (let [node, path] of children) {
      if (Text.isText(node)) {
        output.push({ ...node });
      } else {
        let count = Array.from(node.children).length;
        for (let i = 0; i < count; ++i) {
          let o = recursive(node.children[i]);
          for (let j = 0; j < o.length; ++j) {
            output.push(o[j]);
          }
        }
      }
    }

    return output;
  };

  let count = Array.from(Node.children(editor, [])).length;
  let result = recursive(editor);

  let textsMatch = (a, b) => {
    for (let x in a) {
      if (x === 'text') continue;
      if (a.hasOwnProperty(x) && b.hasOwnProperty(x)) {
        if (a[x] !== b[x]) {
          return false;
        }
      }
    }

    for (let x in b) {
      if (x === 'text') continue;
      if (a.hasOwnProperty(x) && b.hasOwnProperty(x)) {
        if (a[x] !== b[x]) {
          return false;
        }
      }
    }

    return true;
  };

  for (let i = 0; i < result.length - 1; ++i) {
    let a = result[i];
    let b = result[i + 1];

    let m = textsMatch(a, b);
    // console.log('matches ' + m.toString(), a, b);
    if (m) {
      result[i].text += b.text;
      // console.log('matches SO ', result[i]);
      result.splice(i + 1, 1);
    }
  }

  if (result.length === 0) {
    result.push({ text: '' });
  }

  // Editor.withoutNormalizing(editor, () => {
  // let count2 = Array.from(Node.children(editor, [0])).length;
  // console.log('count', count);
  // console.log('editor.children', editor.children);
  // selectAll(editor);
  // for (let i = 0; i < count2; ++i) {
  Editor.withoutNormalizing(editor, () => {
    Transforms.removeNodes(editor, { at: [0 /* , i */] });
    Transforms.insertNodes(
      editor,
      { type: 'paragraph', children: [{ text: '' }] },
      { at: [0] },
    );
    // Transforms.delete(editor);

    console.log('before replacing selection', editor.children);
    Transforms.insertFragment(editor, [...result], { at: [0] });
  });
  // Transforms.select(editor, Editor.start(editor, [0]));
  console.log('after replacing selection', editor.children);
  console.log('after paragraphizing', editor.children);
  // Transforms.delete(editor, {
  //   at: Editor.start(editor, [0]),
  //   distance: 1,
  //   unit: 'block',
  // });
  // console.log("root's children list", result);
  // needs normalizing here because in [] there is no Text otherwise, and that is needed for this to work:
  // Editor.withoutNormalizing(editor, () => {
  // console.log('output', JSON.stringify(output, null, 2));
  // Transforms.select(editor, {
  //   anchor: Editor.start(editor, []),
  //   focus: Editor.end(editor, []),
  // });
  // Transforms.insertNodes(
  //   editor,
  //   { type: 'paragraph', children: [...result] },
  //   {
  //     at: {
  //       anchor: Editor.start(editor, []),
  //       focus: Editor.end(editor, []),
  //     },
  //   },
  // );

  // TODO: somehow remove the root numbered-list or whatever list type it is (or heading-three two etc.)
  // selectAll(editor);
  // console.log('editor.children', editor.children);

  // Transforms.mergeNodes(editor, {
  //   at: {
  //     anchor: Editor.start(editor, []),
  //     focus: Editor.end(editor, []),
  //   },
  // });

  // console.log('editor.children', JSON.stringify(editor.children, null, 2));
};

export const unwrapList = (
  editor,
  willWrapAgain,
  {
    typeUl = 'bulleted-list',
    typeOl = 'numbered-list',
    typeLi = 'list-item',
    unwrapFromList = false,
  } = {},
) => {
  // TODO: toggling from one list type to another should keep the structure untouched
  if (
    editor.selection &&
    Range.isExpanded(editor.selection) &&
    unwrapFromList
  ) {
    if (unwrapFromList) {
      // console.log('before unwrapping from list', editor.children);
      // let pgs = [];
      // for (let li of editor.children[0]) {
      //   if (li.children[0].type === 'paragraph')
      // }
      // unwrapNodesByType(editor, [typeLi]);
      // unwrapNodesByType(editor, [typeUl, typeOl], {
      //   split: true,
      // });
    } else {
    }
  } else {
    unwrapNodesByType(editor, [typeLi], { at: getMaxRange(editor) });
    unwrapNodesByType(editor, [typeUl, typeOl], {
      at: getMaxRange(editor),
    });
  }

  if (!willWrapAgain) {
    console.log('before paragraphizing', editor.children);
    convertAllToParagraph(editor);
  }
};

const getSelectionNodesArrayByType = (editor, types, options = {}) =>
  Array.from(getSelectionNodesByType(editor, types, options));

export const toggleList = (
  editor,
  {
    typeList,
    typeUl = 'bulleted-list',
    typeOl = 'numbered-list',
    typeLi = 'list-item',
    typeP = 'paragraph',
  },
) => {
  // TODO: set previous selection (not this 'select all' command) after toggling list (in all three cases: toggling to numbered, bulleted or none)
  selectAll(editor);

  const isActive = isNodeInSelection(editor, typeList);

  const willWrapAgain = !isActive;

  unwrapList(editor, willWrapAgain, { typeUl, typeOl, typeLi });

  Transforms.setNodes(editor, {
    type: typeP,
  });

  if (!isActive) {
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
};

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();

  const handleMouseDown = React.useCallback(
    (event) => {
      event.preventDefault();

      const isListType = (t) => {
        return t === 'bulleted-list' || t === 'numbered-list';
      };

      switch (format) {
        case 'bulleted-list':
        case 'numbered-list':
          toggleList(editor, {
            typeList: format,
          });
          break;
        case 'block-quote':
          // if (isBlockActive(editor, 'block-quote')) {
          // unwrapNodesByType(editor, ['block-quote']);
          // } else {
          // if (!willWrapAgain) {
          // console.log('before paragraphizing', editor.children);
          // if (!isBlockActive(editor, 'block-quote')) {
          convertAllToParagraph(editor);
          // selectAll(editor);
          // console.log('editor.children', editor.children);
          // }
          // Transforms.select(editor, [0]);
          console.log('altered selection');
          toggleBlock(editor, format, false);
          console.log('toggled block');
          break;
        case 'heading-two':
        case 'heading-three':
          const ufl = !!Editor.above(editor, {
            match: (n) => isListType(n.type),
          });
          unwrapList(editor, false, {
            unwrapFromList: ufl,
          });
          // TODO: uncomment this so that toggleBlock below works well
          selectAll(editor);
          toggleBlock(editor, format, false);
          break;
        default:
          toggleBlock(editor, format, false);
          break;
      }
    },
    [editor, format],
  );

  return (
    <ToolbarButton
      active={!!getActiveEntry(editor, format)}
      onMouseDown={handleMouseDown}
      icon={icon}
    />
  );
};

export default BlockButton;
