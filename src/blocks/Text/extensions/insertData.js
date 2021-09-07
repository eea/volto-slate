import { deconstructToVoltoBlocks } from 'volto-slate/utils';

export const withInsertData = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const result = insertData(data);
    deconstructToVoltoBlocks(editor);
    return result;
  };

  return editor;
};
