import { Editor, Text, Transforms } from 'slate';
import { deserialize } from 'volto-slate/editor/deserialize';

export const insertData = (editor) => {
  const { insertData, apply } = editor;

  // editor.apply = (op) => {
  //   console.log('op', op);
  //   return apply(op);
  // };

  editor.insertData = (data) => {
    console.log('data', data);
    const html = data.getData('text/html');

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');

      const fragment = deserialize(editor, parsed.body);
      console.log('parsed', parsed, fragment);

      // Delete the empty placeholder paragraph, if we can
      const isEmpty = !Editor.string(editor, []);
      const isTextFragment =
        Array.isArray(fragment) &&
        fragment.length === 1 &&
        (Editor.isInline(fragment[0]) || Text.isText(fragment[0]));
      if (isEmpty && !isTextFragment) {
        console.log(
          'deletenodes',
          isTextFragment,
          fragment,
          Editor.isInline(fragment[0]),
        );
        Transforms.removeNodes(editor);
      }

      // TODO: insertNodes works a lot better then insertFragment (needs less cleanup)
      // but insertFragment is more reliable to get content inserted
      // We can't afford to insert a fragment, we want Slate to clean up
      // Editor.insertFragment(editor, fragment);
      // Transforms.insertFragment(editor, fragment);
      Transforms.deselect(editor);
      Transforms.insertNodes(editor, fragment);
      Transforms.deselect(editor);

      return;
    }

    insertData(data);
  };

  return editor;
};
