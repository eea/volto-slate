import { deconstructToVoltoBlocks } from 'volto-slate/utils';

export const withInsertData = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    insertData(data);
    deconstructToVoltoBlocks(editor);
  };

  return editor;
};
