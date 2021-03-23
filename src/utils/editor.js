import { Editor, Transforms } from 'slate';

export function setEditorContent(editor, block) {
  Transforms.removeNodes(editor, { at: [0] }); // TODO: at: [] needs rethinking
  Transforms.insertNodes(editor, block);
}

export { Editor };
