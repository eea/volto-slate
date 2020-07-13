import { nanoid } from 'volto-slate/utils';

export const withNodeIds = (editor) => {
  const { insertNode, insertText, apply } = editor;

  // console.log('withNodeIds');
  //
  // editor.insertNode = (node) => {
  //   node.id = nanoid(8);
  //   console.log('node', node);
  //   return insertNode(node);
  // };
  //
  // editor.op = (op) => {
  //   console.log('op', op);
  //   return apply(op);
  // };
  //
  // editor.insertText = (text) => {
  //   console.log('text', text);
  //   return insertText(text);
  // };
  //
  return editor;
};
