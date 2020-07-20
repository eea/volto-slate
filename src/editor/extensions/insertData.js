import { Editor, Transforms } from 'slate';
import { deserialize } from 'volto-slate/editor/deserialize';
import { settings } from '~/config';

// TODO: implement for the wysiwyg editor

export const insertData = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    // console.log('paste data', data);
    const html = data.getData('text/html');
    console.log('insert', data);

    if (html) {
      console.log('html', html);
      const parsed = new DOMParser().parseFromString(html, 'text/html');

      const fragment = deserialize(editor, parsed.body);
      console.log('fragment', fragment);

      // Replace the current selection with pasted content
      if (!Editor.string(editor, [])) Transforms.removeNodes(editor);

      // We can't afford to insert a fragment, we want Slate to clean up
      // Editor.insertFragment(editor, fragment);
      Transforms.insertNodes(editor, fragment);

      return;
    }

    insertData(data);
  };

  return editor;
};
