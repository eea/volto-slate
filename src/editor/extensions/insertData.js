import { Editor, Text, Transforms, Block } from 'slate';
import { deserialize } from 'volto-slate/editor/deserialize';
import { deconstructToVoltoBlocks } from 'volto-slate/utils';
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

  // console.log('insertData extension here ');
  editor.insertData = (data) => {
    console.log('data in custom editor.insertData', data);
    // const text = data.getData('text/rtf');
    // console.log('text', text);
    const html = data.getData('text/html');

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');

      let body;
      if (parsed.getElementsByTagName('google-sheets-html-origin').length > 0) {
        body = parsed.querySelector('google-sheets-html-origin > table');
      } else {
        body = parsed.body;
      }

      console.log('deserialize body', body);
      let fragment = deserialize(editor, body);
      console.log('parsed body', parsed);
      console.log('parse fragment', fragment);

      // If there is no text in the editor
      if (!Editor.string(editor, [])) {
        if (
          Array.isArray(fragment) &&
          fragment.findIndex((b) => Editor.isInline(b) || Text.isText(b)) > -1
        ) {
          Transforms.insertFragment(editor, fragment);
          return;
        }

        // Delete the empty placeholder paragraph, if we can
        // Transforms.deselect(editor);
        Transforms.removeNodes(editor);

        // Wrap the text nodes of the fragment in paragraphs
        // fragment = Array.isArray(fragment)
        //   ? fragment.map((b) =>
        //       Editor.isInline(b) || Text.isText(b) ? createBlock(b) : b,
        //     )
        //   : fragment;
        // console.log('Pasting in empty block:', fragment);
      }

      // TODO: use Editor.isEmpty(editor, editor);

      // TODO: insertNodes works a lot better then insertFragment (needs less cleanup)
      // but insertFragment is more reliable to get content inserted
      // We can't afford to insert a fragment, we want Slate to clean up
      // Editor.insertFragment(editor, fragment);
      // Transforms.insertFragment(editor, fragment);

      Transforms.insertNodes(editor, fragment);

      // TODO: This used to solve a problem when pasting images. What is it?
      // Transforms.deselect(editor);

      return;
    }

    insertData(data);
  };

  return editor;
};
