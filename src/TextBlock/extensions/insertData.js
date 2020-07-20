import { deconstructToVoltoBlocks } from 'volto-slate/utils';

export const insertData = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    insertData(data);
    deconstructToVoltoBlocks(editor);
    return;
  };
  return editor;
};
