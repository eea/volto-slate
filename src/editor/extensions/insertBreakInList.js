import { getCurrentListItem, isCursorInList } from '../../utils/lists';
import { P, LISTITEM } from '../../constants';
import { Node, Editor, Element } from 'slate';
import { Transforms, Range } from 'slate';

const isInsideListAndInsideP = (editor) => {
  const ancestors = Array.from(Editor.levels(editor, { at: editor.selection }));

  const relevantAnc = ancestors.filter(([node, path]) => {
    if (Element.isElement(node) && node.type === P) {
      return true;
    }
    return false;
  });

  const relAncCount = relevantAnc.length;

  if (isCursorInList(editor)) {
    if (relAncCount >= 1) {
      return true;
    }
  }
  return false;
};

const getNodeInSelection = (editor) => {
  return Editor.above(editor, {
    at: editor.selection,
  });
};

const whileSelectionOfTypeLiftNodes = (editor, type) => {
  while (true) {
    const [firstNodeInSelection] = getNodeInSelection(editor);
    const matches = Node.matches(firstNodeInSelection, { type });

    if (!matches) {
      break;
    }

    // const [lastNodeInSelection] = getNodeInSelection(editor);
    Transforms.liftNodes(
      editor,
      firstNodeInSelection /* lastNodeInSelection */,
    );
    Transforms.setNodes(editor, { type: LISTITEM });
    // Transforms.liftNodes(editor, Editor.last(editor, editor.selection)[0]);
  }
};

// TODO: make this work well
export const withBreakInList = (editor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const r = insertBreak();

    const ii = isInsideListAndInsideP(editor);

    if (ii) {
      whileSelectionOfTypeLiftNodes(editor, P);
    }

    return r;
  };

  return editor;
};
