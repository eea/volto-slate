import { Editor, Transforms } from 'slate';
import { deserialize } from 'volto-slate/editor/deserialize';

// TODO: implement for the wysiwyg editor

export const insertData = (editor) => {
  const { insertData } = editor;

  // editor.isVoid = (element) => {
  //   return element.type === 'image' ? true : isVoid(element);
  // };

  editor.insertData = (data) => {
    // console.log('paste data', data);
    const html = data.getData('text/html');

    if (html) {
      console.log('html', html);
      const parsed = new DOMParser().parseFromString(html, 'text/html');

      const fragment = deserialize(editor, parsed.body);
      console.log('fragment', fragment);

      // const firstNodeType = fragment[0].type;
      // replace the selected node type by the first block type
      // if (firstNodeType && !inlineTypes.includes(firstNodeType)) {
      //   Transforms.setNodes(editor, { type: fragment[0].type });
      // }

      // TODO: implement split to volto blocks

      // Replace the current selection with pasted content
      //
      // TODO: removeNodes is not correct, it removes the active node. Should
      // test if the current node is empty, then remove it, otherwise insert
      // after it
      Transforms.removeNodes(editor);
      Transforms.insertNodes(editor, fragment);

      // We can't afford to insert a fragment, as it will mess up our carefully
      // constructed fragment with its logic.
      // Editor.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};
