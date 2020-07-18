import { Transforms } from 'slate';
import { deserialize } from 'volto-slate/editor/deserialize';

export const withDeserializeHtml = (editor) => {
  const { insertData } = editor;

  // editor.isInline = (element) => {
  //   return element.type === 'link' ? true : isInline(element);
  // };

  // editor.isVoid = (element) => {
  //   return element.type === 'image' ? true : isVoid(element);
  // };

  // const inlineTypes = ['link'];

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
      Transforms.insertNodes(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};
