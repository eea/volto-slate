import { getCurrentListItem, isCursorInList } from '../../utils/lists';
import { P } from '../../constants';
import { Node, Editor } from 'slate';
import { Transforms, Range } from 'slate';

const isInsideListAndInsideP = (editor) => {
  if (isCursorInList(editor)) {
    if (
      Array.from(Node.ancestors(editor, [])).filter((anc) => {
        if (Element.isElement(anc) && anc.type === P) {
          return true;
        }
        return false;
      }).length >= 1
    ) {
      return true;
    }
  }
  return false;
};

const whileSelectionOfTypeLiftNodes = (editor, type) => {
  while (Editor.node(editor, editor.selection)[0].type === type) {
    Transforms.liftNodes(editor, { at: editor.selection });
  }
};

// TODO: make this work well
export const withBreakInList = (editor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    // if (isInsideListAndInsideP(editor)) {
    //   whileSelectionOfTypeLiftNodes(editor, P);
    // }

    return insertBreak();
  };

  return editor;
};
