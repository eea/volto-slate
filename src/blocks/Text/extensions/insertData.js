import { Editor } from 'slate';
import { deconstructToVoltoBlocks } from 'volto-slate/utils';

/**
 * The editor extended with this extension supports automattic conversion of some types of data storeable in Slate documents into separate Volto blocks. The `deconstructToVoltoBlocks` function scans the contents of the Slate document and, through configured Volto block emitters, it outputs separate Volto blocks into the same Volto page form. The `deconstructToVoltoBlocks` function should be called only in key places where it is necessary. This extension first of all calls the default `insertData` behavior of the Slate editor.
 *
 * @param {Editor} editor The Slate editor object to extend.
 */
export const withInsertData = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    insertData(data);
    deconstructToVoltoBlocks(editor);
  };

  return editor;
};
