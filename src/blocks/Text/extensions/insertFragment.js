import { deconstructToVoltoBlocks } from 'volto-slate/utils';

export const insertFragment = (editor) => {
  const { insertFragment } = editor;

  editor.insertFragment = (entry) => {
    console.log('before insert', entry);
    insertFragment(entry);

    console.log(
      'editor children after insert fragment',
      JSON.stringify(editor.children),
    );
    deconstructToVoltoBlocks(editor);
  };

  return editor;
};
