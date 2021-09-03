import { deconstructToVoltoBlocks } from 'volto-slate/utils';

export const insertFragment = (editor) => {
  const { insertFragment } = editor;

  editor.insertFragment = (entry) => {
    insertFragment(entry);

    deconstructToVoltoBlocks(editor);
  };

  return editor;
};
