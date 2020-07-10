import { Editor } from 'slate';
import {
  splitEditorInTwoFragments,
  setEditorContent,
  createAndSelectNewBlockAfter,
  isRangeAtRoot,
} from 'volto-slate/utils';

export const withSplitBlocksOnBreak = (editor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    // if selection is expanded, delete it
    if (editor.selection && isRangeAtRoot(editor.selection)) {
      const block = Editor.parent(editor, editor.selection);

      if (block) {
        const [top, bottom] = splitEditorInTwoFragments(editor);
        setEditorContent(editor, top);
        createAndSelectNewBlockAfter(editor, bottom);
      }
      return;
    }

    return insertBreak();
  };

  return editor;
};
