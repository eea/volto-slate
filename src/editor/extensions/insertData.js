import { Editor, Transforms } from 'slate';
import { deserialize } from 'volto-slate/editor/deserialize';

export const insertData = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const html = data.getData('text/html');

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');

      const fragment = deserialize(editor, parsed.body);

      // Replace the current selection with pasted content
      if (!Editor.string(editor, [])) Transforms.removeNodes(editor);

      // We can't afford to insert a fragment, we want Slate to clean up
      // Editor.insertFragment(editor, fragment);
      // Transforms.insertFragment(editor, fragment);
      Transforms.insertNodes(editor, fragment);
      Transforms.deselect(editor);

      return;
    }

    insertData(data);
  };

  return editor;
};
