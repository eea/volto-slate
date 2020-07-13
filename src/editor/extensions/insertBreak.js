import { Transforms, Range } from 'slate';

export const withDeleteSelectionOnEnter = (editor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    // if selection is expanded, delete it
    if (Range.isExpanded(editor.selection)) {
      Transforms.delete(editor);
    }
    console.log(editor.children);
    return insertBreak();
  };

  return editor;
};
