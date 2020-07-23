import { FOOTNOTE } from './constants';
import { nanoid } from 'volto-slate/utils';
import { Transforms } from 'slate';

export const withFootnote = (editor) => {
  const { isInline, normalizeNode } = editor;

  editor.isInline = (element) => {
    return element.type === FOOTNOTE ? true : isInline(element);
  };

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;
    if (node.type === FOOTNOTE && !node.data?.uid) {
      Transforms.setNodes(
        editor,
        {
          data: {
            uid: nanoid(5),
          },
        },
        {
          at: path,
        },
      );
      console.log('set uid', node);
    }
    return normalizeNode(entry);
  };

  return editor;
};
