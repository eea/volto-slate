import { deconstructToVoltoBlocks } from 'volto-slate/utils';

export const withInsertData = (editor) => {
  const { insertData } = editor;

  if (!editor._textblockInsertData) {
    editor.insertData = (data) => {
      insertData(data);
      deconstructToVoltoBlocks(editor);
    };
    editor._textblockInsertData = true;
  }

  return editor;
};
