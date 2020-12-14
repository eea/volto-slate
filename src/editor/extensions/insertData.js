import { Editor, Text, Transforms } from 'slate';
import { deserialize } from 'volto-slate/editor/deserialize';
import {
  createDefaultBlock,
  normalizeBlockNodes,
  deconstructToVoltoBlocks,
} from 'volto-slate/utils';

export const insertData = (editor) => {
  // const { insertData } = editor;

  editor.dataTransferHandlers = {
    ...(editor.dataTransferHandlers || {}),
    'application/x-slate-fragment': (dt, fullMime) => {
      const decoded = decodeURIComponent(window.atob(dt));
      const parsed = JSON.parse(decoded);
      editor.insertFragment(parsed);
      deconstructToVoltoBlocks(editor);
      return true;
    },
    'text/html': (dt, fullMime) => {
      const parsed = new DOMParser().parseFromString(dt, 'text/html');

      const body =
        parsed.getElementsByTagName('google-sheets-html-origin').length > 0
          ? parsed.querySelector('google-sheets-html-origin > table')
          : parsed.body;

      let fragment = deserialize(editor, body);

      // console.log('deserialize body', body);
      // console.log('parsed body', parsed);

      const val = deserialize(editor, body);
      fragment = Array.isArray(val) ? val : [val];

      // When there's already text in the editor, insert a fragment, not nodes
      if (Editor.string(editor, [])) {
        if (
          Array.isArray(fragment) &&
          fragment.findIndex((b) => Editor.isInline(b) || Text.isText(b)) > -1
        ) {
          // console.log('insert fragment', fragment);
          // TODO: we want normalization also when dealing with fragments
          Transforms.insertFragment(editor, fragment);
          return true;
        }
      }

      // console.log('fragment', fragment);
      const nodes = normalizeBlockNodes(editor, fragment);
      // console.log('insert nodes', nodes);
      Transforms.insertNodes(editor, nodes);

      // TODO: This used to solve a problem when pasting images. What is it?
      // Transforms.deselect(editor);
      deconstructToVoltoBlocks(editor);
      return true;
    },
    'text/plain': (dt, fullMime) => {
      const text = dt;
      if (!text) return;
      const paras = text.split('\n');
      const fragment = paras.map((p) => createDefaultBlock([{ text: p }]));
      // return insertData(data);

      // When there's already text in the editor, insert a fragment, not nodes
      if (Editor.string(editor, [])) {
        if (
          Array.isArray(fragment) &&
          fragment.findIndex((b) => Editor.isInline(b) || Text.isText(b)) > -1
        ) {
          // console.log('insert fragment', fragment);
          // TODO: we want normalization also when dealing with fragments
          Transforms.insertFragment(editor, fragment);
          return true;
        }
      }

      // console.log('fragment', fragment);
      const nodes = normalizeBlockNodes(editor, fragment);
      // console.log('insert nodes', nodes);
      Transforms.insertNodes(editor, nodes);

      // TODO: This used to solve a problem when pasting images. What is it?
      // Transforms.deselect(editor);
      deconstructToVoltoBlocks(editor);
      return true;
    },
  };

  // TODO: use the rtf data to get the embedded images.
  // const text = data.getData('text/rtf');

  return editor;
};

//   // Delete the empty placeholder paragraph, if we can
//   // Transforms.deselect(editor);
//   Transforms.removeNodes(editor);
//   // Wrap the text nodes of the fragment in paragraphs
//   // fragment = Array.isArray(fragment)
//   //   ? fragment.map((b) =>
//   //       Editor.isInline(b) || Text.isText(b) ? createBlock(b) : b,
//   //     )
//   //   : fragment;
//   // console.log('Pasting in empty block:', fragment);
