import { Editor, Text, Transforms } from 'slate';
import { deserialize } from 'volto-slate/editor/deserialize';
import { createDefaultBlock, normalizeBlockNodes } from 'volto-slate/utils';

export const insertData = (editor) => {
  // const { insertData } = editor;

  editor.insertData = (data) => {
    // console.log('data in custom editor.insertData', data);
    // TODO: use the rtf data to get the embedded images.
    // const text = data.getData('text/rtf');
    // console.log('text', text);

    let fragment;

    fragment = data.getData('application/x-slate-fragment');

    if (fragment) {
      const decoded = decodeURIComponent(window.atob(fragment));
      const parsed = JSON.parse(decoded);
      editor.insertFragment(parsed);
      return;
    }

    const html = data.getData('text/html');
    // TODO: Avoid responding to drag/drop and others
    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');

      const body =
        parsed.getElementsByTagName('google-sheets-html-origin').length > 0
          ? parsed.querySelector('google-sheets-html-origin > table')
          : parsed.body;

      // console.log('deserialize body', body);
      // console.log('parsed body', parsed);

      fragment = deserialize(editor, body);
    } else {
      const text = data.getData('text/plain');
      if (!text) return;
      const paras = text.split('\n');
      fragment = paras.map((p) => createDefaultBlock([{ text: p }]));
      // return insertData(data);
    }

    // When there's already text in the editor, insert a fragment, not nodes
    if (Editor.string(editor, [])) {
      if (
        Array.isArray(fragment) &&
        fragment.findIndex((b) => Editor.isInline(b) || Text.isText(b)) > -1
      ) {
        // console.log('insert fragment', fragment);
        // TODO: we want normalization also when dealing with fragments
        Transforms.insertFragment(editor, fragment);
        return;
      }
    }

    // console.log('fragment', fragment);
    const nodes = normalizeBlockNodes(editor, fragment);
    // console.log('insert nodes', nodes);
    Transforms.insertNodes(editor, nodes);

    // TODO: This used to solve a problem when pasting images. What is it?
    // Transforms.deselect(editor);
  };

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
