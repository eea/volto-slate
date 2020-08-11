import { Editor, Text, Transforms } from 'slate';
import { deserialize } from 'volto-slate/editor/deserialize';
import { settings } from '~/config';

function createBlock(textNode) {
  return {
    type: settings.slate.defaultBlockType,
    children: [textNode],
  };
}

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
      if (parsed.getElementsByTagName('google-sheets-html-origin').length > 0) {
        body = parsed.querySelector('google-sheets-html-origin > table');
      } else {
        body = parsed.body;
      }

      let fragment = deserialize(editor, body);
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
