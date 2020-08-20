import { Editor, Text, Transforms, Block } from 'slate';
import { deserialize } from 'volto-slate/editor/deserialize';
import { settings } from '~/config';

/**
 * @param {Text} textNode The (leaf) Text node to wrap.
 *
 * @returns {Block} A Slate block node, of the default block type configured in the Slate settings, containing the given Text node.
 */
function createBlock(textNode) {
  return {
    type: settings.slate.defaultBlockType,
    children: [textNode],
  };
}

/**
 * @summary Inserts in the given editor the feature of being able to paste HTML content in it.
 *
 * @param {Editor} editor A Slate editor object.
 */
export const insertData = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    console.log('data', data);
    // const text = data.getData('text/rtf');
    // console.log('text', text);
    const html = data.getData('text/html');

    // editor.htmlTagsToSlate = {
    //   ...editor.htmlTagsToSlate,
    //   IMG: deserializeImageTag,
    // };

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');

      let body;
      let fragment;
      // If the second parameter passed to `deserialize()` is a `<table>` in a `<google-sheets-html-origin>` the return value is for sure an array with a Slate Node with type 'table'. If the same second parameter is a `<body>` the return value is for sure an array with a single `Node[]` (Slate fragment) in it.
      if (parsed.getElementsByTagName('google-sheets-html-origin').length > 0) {
        body = parsed.querySelector('google-sheets-html-origin > table');
        // If the second parameter is a `<table>` in a `<google-sheets-html-origin>` the return value is for sure a Slate Node with type 'table'.
        fragment = [deserialize(editor, body)[0]]; // we must convert it to an array
      } else {
        body = parsed.body;
        // If the second parameter is a `<body>` the return value is for sure an array with a single `Node[]` (Slate fragment) in it.
        fragment = deserialize(editor, body)[0]; // we don't have to convert it to an array
      }

      console.log('parsed', parsed, fragment);

      if (!Editor.string(editor, [])) {
        // Delete the empty placeholder paragraph, if we can
        Transforms.deselect(editor);
        Transforms.removeNodes(editor);

        // Wrap the text nodes of the fragment in paragraphs
        fragment = fragment.map((b) =>
          Editor.isInline(b) || Text.isText(b) ? createBlock(b) : b,
        );
        console.log('Pasting in empty block:', fragment);
      }

      // TODO: use Editor.isEmpty(editor, editor);

      // TODO: insertNodes works a lot better then insertFragment (needs less cleanup)
      // but insertFragment is more reliable to get content inserted
      // We can't afford to insert a fragment, we want Slate to clean up
      // Editor.insertFragment(editor, fragment);
      // Transforms.insertFragment(editor, fragment);

      Transforms.insertNodes(editor, fragment);
      Transforms.deselect(editor); // Solves a problem when pasting images

      // console.log('AFTER TABLE PASTE', editor.children);

      return;
    }

    insertData(data);
  };

  return editor;
};
