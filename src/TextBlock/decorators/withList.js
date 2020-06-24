import { Editor, Path, Point, Range, Transforms, Text, Node } from 'slate';
import { castArray } from 'lodash';

/**
 * See {@link Range.isCollapsed}.
 * Return false if `range` is not defined.
 */
const isCollapsed = (range) => !!range && Range.isCollapsed(range);

/**
 * When deleting backward at the start of an empty block, reset the block type to a default type.
 */
const withDeleteStartReset = ({
  defaultType = 'paragraph',
  types,
  onUnwrap,
}) => (editor) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (isCollapsed(selection)) {
      const parent = Editor.above(editor, {
        match: (n) => types.includes(n.type),
      });

      if (parent) {
        const [, parentPath] = parent;
        const parentStart = Editor.start(editor, parentPath);

        if (selection && Point.equals(selection.anchor, parentStart)) {
          Transforms.setNodes(editor, { type: defaultType });

          if (onUnwrap) {
            onUnwrap();
          }

          return;
        }
      }
    }

    deleteBackward(...args);
  };

  return editor;
};

const isPointAtRoot = (point) => point.path.length === 2;

const isRangeAtRoot = (range) =>
  isPointAtRoot(range.anchor) || isPointAtRoot(range.focus);

const unwrapNodesByType = (editor, types, options = {}) => {
  types = castArray(types);

  Transforms.unwrapNodes(editor, {
    match: (n) => types.includes(n.type),
    ...options,
  });
};

/**
 * Get the block above the selection. If not found, return the editor entry.
 */
const getBlockAboveSelection = (editor) =>
  Editor.above(editor, {
    match: (n) => Editor.isBlock(editor, n),
  }) || [editor, []];

/**
 * Has the node an empty text
 * TODO: try Node.string
 */
const isBlockTextEmpty = (node) => {
  const lastChild = node.children[node.children.length - 1];

  return Text.isText(lastChild) && !lastChild.text.length;
};

/**
 * When inserting break at the start of an empty block, reset the block type to a default type.
 */
const withBreakEmptyReset = ({
  types,
  defaultType = 'paragraph',
  onUnwrap,
}) => (editor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const blockEntry = getBlockAboveSelection(editor);

    const [block] = blockEntry;

    if (isBlockTextEmpty(block)) {
      const parent = Editor.above(editor, {
        match: (n) => types.includes(n.type),
      });

      if (parent) {
        Transforms.setNodes(editor, { type: defaultType });

        if (onUnwrap) {
          onUnwrap();
        }

        return;
      }
    }

    insertBreak();
  };

  return editor;
};

/**
 * Combine {@link withBreakEmptyReset} and {@link withDeleteStartReset}.
 */
const withResetBlockType = (options) => (editor) => {
  editor = withBreakEmptyReset(options)(editor);
  editor = withDeleteStartReset(options)(editor);

  return editor;
};

const withList = ({
  typeUl = 'bulleted-list',
  typeOl = 'numbered-list',
  typeLi = 'list-item',
  typeP = 'paragraph',
} = {}) => (editor) => {
  const { insertBreak } = editor;

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
        const [listItemNode, listItemPath] = Editor.parent(
          editor,
          paragraphPath,
        );

        // if the paragraph is inside a list item
        if (listItemNode.type === typeLi) {
          // if selection is expanded, delete it
          if (!Range.isCollapsed(editor.selection)) {
            Transforms.delete(editor);
          }

          const start = Editor.start(editor, paragraphPath);
          const end = Editor.end(editor, paragraphPath);

          const isStart = Point.equals(editor.selection.anchor, start);
          const isEnd = Point.equals(editor.selection.anchor, end);

          const nextParagraphPath = Path.next(paragraphPath);
          const nextListItemPath = Path.next(listItemPath);

          /**
           * If cursor on start of paragraph, if the paragraph is empty, remove the paragraph (and the list item), then break the block!
           * if it is not empty, insert a new empty list item.
           */
          if (isStart) {
            if (isBlockTextEmpty(paragraphNode)) {
              console.log('remove list item and split here');
            } else {
              Transforms.insertNodes(
                editor,
                {
                  type: typeLi,
                  children: [{ type: typeP, children: [{ text: '' }] }],
                },
                { at: listItemPath },
              );
            }
          }

          /**
           * If not end, split nodes, wrap a list item on the new paragraph and move it to the next list item
           */
          if (!isEnd) {
            Transforms.splitNodes(editor, { at: editor.selection });
            Transforms.wrapNodes(
              editor,
              {
                type: typeLi,
                children: [],
              },
              { at: nextParagraphPath },
            );
            Transforms.moveNodes(editor, {
              at: nextParagraphPath,
              to: nextListItemPath,
            });
          } else {
            /**
             * If end, insert a list item after and select it
             */
            Transforms.insertNodes(
              editor,
              {
                type: typeLi,
                children: [{ type: typeP, children: [{ text: '' }] }],
              },
              { at: nextListItemPath },
            );
            Transforms.select(editor, nextListItemPath);
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

          return;
        }
      }
    }

    insertBreak();
  };

  const onResetListType = () => {
    unwrapNodesByType(editor, typeLi, { split: true });
    unwrapNodesByType(editor, [typeUl, typeOl], { split: true });
  };

  editor = withResetBlockType({
    types: [typeLi],
    defaultType: typeP,
    onUnwrap: onResetListType,
  })(editor);

  return editor;
};

export default withList;
