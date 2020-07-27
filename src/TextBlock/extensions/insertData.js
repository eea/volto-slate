import { deconstructToVoltoBlocks } from 'volto-slate/utils';

export const withInsertData = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    insertData(data);
    // console.log('insert', editor.children);
    deconstructToVoltoBlocks(editor);
  };

  return editor;
};
