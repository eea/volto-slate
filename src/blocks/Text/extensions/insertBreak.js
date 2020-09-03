import { Editor } from 'slate';
import { ReactEditor } from 'slate-react';
import {
  splitEditorInTwoFragments,
  setEditorContent,
  createAndSelectNewBlockAfter,
  isRangeAtRoot,
} from 'volto-slate/utils';

/**
 * @param {Editor} editor The Slate editor object to extend.
 * @description If the selection exists and touches with one of its edges a
 * closest-to-root `Text` node (`Path` with length `2`)
 *
 *   - if the parent node of the selection exists, split editor into two
 *     fragments put inside separate Volto Slate Text blocks;
 *   - if the parent node of the selection does not exist, do nothing;
 *
 * and if the selection does not exist or does not touch with one of its edges a
 * closest-to-root `Text` node, call the default behavior.
 */
export const withSplitBlocksOnBreak = (editor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    // if selection is expanded, delete it
    if (editor.selection && isRangeAtRoot(editor.selection)) {
      const block = Editor.parent(editor, editor.selection);

      if (block) {
        const [top, bottom] = splitEditorInTwoFragments(editor);
        setEditorContent(editor, top);
        ReactEditor.blur(editor);
        createAndSelectNewBlockAfter(editor, bottom);
      }
      return;
    }

    return insertBreak();
  };

  return editor;
};
