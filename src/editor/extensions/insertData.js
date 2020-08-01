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

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');

      let fragment = deserialize(editor, parsed.body);
      console.log('parsed', parsed, fragment);

      if (!Editor.string(editor, [])) {
        // Delete the empty placeholder paragraph, if we can
        Transforms.deselect(editor);
        Transforms.removeNodes(editor);

        // Wrap the text nodes of the fragment in paragraphs
        fragment = fragment.map((b) =>
          Editor.isInline(b) || Text.isText(b) ? createBlock(b) : b,
        );
        console.log('removed nodes', fragment);
      }

      // TODO: use Editor.isEmpty(editor, editor);

      // const isTextFragment =
      //   Array.isArray(fragment) &&
      //   fragment.length === 1 &&
      //   (Editor.isInline(fragment[0]) || Text.isText(fragment[0]));

      // TODO: insertNodes works a lot better then insertFragment (needs less cleanup)
      // but insertFragment is more reliable to get content inserted
      // We can't afford to insert a fragment, we want Slate to clean up
      // Editor.insertFragment(editor, fragment);
      // Transforms.insertFragment(editor, fragment);

      // if (isEmpty && !isTextFragment) {
      //   console.log(
      //     'deletenodes',
      //     isTextFragment,
      //     fragment,
      //     Editor.isInline(fragment[0]),
      //   );
      //   // Transforms.removeNodes(editor);
      // }

      Transforms.insertNodes(editor, fragment);
      Transforms.deselect(editor); // Solves a problem when pasting images

      return;
    }

    insertData(data);
  };

  return editor;
};
