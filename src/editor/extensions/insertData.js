import { Editor, Text, Transforms } from 'slate';
import { deserialize } from 'volto-slate/editor/deserialize';

export const insertData = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    // console.log('data in custom editor.insertData', data);
    // const text = data.getData('text/rtf');

    let fragment;

    const html = data.getData('text/html');
    fragment = data.getData('application/x-slate-fragment');

    if (fragment) {
      const decoded = decodeURIComponent(window.atob(fragment));
      const parsed = JSON.parse(decoded);
      editor.insertFragment(parsed);
      return;
    }

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');

      const body =
        parsed.getElementsByTagName('google-sheets-html-origin').length > 0
          ? parsed.querySelector('google-sheets-html-origin > table')
          : parsed.body;

      fragment = deserialize(editor, body);
      console.log('deserialize body', body);
      console.log('parsed body', parsed);
      console.log('parsed fragment', fragment);

      Transforms.insertNodes(editor, fragment);

      // TODO: This used to solve a problem when pasting images. What is it?
      // Transforms.deselect(editor);

      return;
    }

    insertData(data);
  };

  return editor;
};

// If there is no text in the editor
// if (!Editor.string(editor, [])) {
//   if (
//     Array.isArray(fragment) &&
//     fragment.findIndex((b) => Editor.isInline(b) || Text.isText(b)) > -1
//   ) {
//     Transforms.insertFragment(editor, fragment);
//     return;
//   }
//
//   // Delete the empty placeholder paragraph, if we can
//   // Transforms.deselect(editor);
//   Transforms.removeNodes(editor);
//
//   // Wrap the text nodes of the fragment in paragraphs
//   // fragment = Array.isArray(fragment)
//   //   ? fragment.map((b) =>
//   //       Editor.isInline(b) || Text.isText(b) ? createBlock(b) : b,
//   //     )
//   //   : fragment;
//   // console.log('Pasting in empty block:', fragment);
// }

// TODO: use Editor.isEmpty(editor, editor);

// TODO: insertNodes works a lot better then insertFragment (needs less cleanup)
// but insertFragment is more reliable to get content inserted
// We can't afford to insert a fragment, we want Slate to clean up
// Editor.insertFragment(editor, fragment);
// Transforms.insertFragment(editor, fragment);
