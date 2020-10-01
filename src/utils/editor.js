import { Transforms, Editor } from 'slate';

export function setEditorContent(editor, block) {
  Transforms.removeNodes(editor, { at: [0] }); // TODO: at: [] needs rethinking
  Transforms.insertNodes(editor, block);
}

/**
 * Inserts something as the last block in the root of the editor.
 * @param {Editor} editor
 * @param {object} block
 */
export function insertAtEnd(editor, block) {
  Transforms.insertNodes(editor, block, {
    // voids: true,
    at: [Editor.end(editor, []).path[0] + 1],
    // match: (n) => Editor.isBlock(editor, n),
  });
}
