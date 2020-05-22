import { Editor, Transforms, Range, Point, Node } from 'slate';
import { settings } from '~/config';

export const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = settings.slate.listTypes.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => settings.slate.listTypes.includes(n.type),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });

  return !!match;
};

export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export function getDOMSelectionInfo() {
  const domSelection = window.getSelection();

  let domRange;
  if (domSelection.rangeCount > 0) {
    domRange = domSelection.getRangeAt(0);
  } else {
    domRange = null;
  }

  const start = domRange?.startOffset;
  const end = domRange?.endOffset;
  const currentCursorPosition = start;

  return {
    domSelection,
    domRange,
    start,
    end,
    currentCursorPosition,
  };
}

/**
 * On insert break at the start of an empty block in types,
 * replace it with a new paragraph.
 */
export const breakEmptyReset = ({
  types,
  typeP,
  newBlockIndex,
  onAddBlock,
  onSelectBlock,
}) => (editor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const currentNodeEntry = Editor.above(editor, {
      match: (n) => Editor.isBlock(editor, n),
    });

    if (currentNodeEntry) {
      const [currentNode] = currentNodeEntry;

      if (Node.string(currentNode).length === 0) {
        const parent = Editor.above(editor, {
          match: (n) =>
            types.includes(
              typeof n.type === 'undefined' ? n.type : n.type.toString(),
            ),
        });

        if (parent) {
          Transforms.setNodes(editor, { type: typeP });
          Transforms.unwrapNodes(editor, {}); // TODO: Slate bug here, I must pass an empty object; fill issue

          //setTimeout(() => {
          onSelectBlock(onAddBlock('slate', newBlockIndex));
          //}, 1000);

          return;
        }
      }
    }

    insertBreak();
  };

  return editor;
};

export const withDelete = (editor) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          Transforms.setNodes(editor, { type: 'paragraph' });

          if (block.type === 'list-item') {
            Transforms.unwrapNodes(editor, {
              match: (n) => n.type === 'bulleted-list',
              split: true,
            });
          }

          return;
        }
      }
      deleteBackward(...args);
    } else {
      deleteBackward(1);
    }
  };

  return editor;
};
