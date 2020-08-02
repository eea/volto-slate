import { v4 as uuid } from 'uuid';
import { Editor, Transforms } from 'slate';
import { IMAGE } from 'volto-slate/constants';

export function syncCreateImageBlock(url) {
  const id = uuid();
  const block = {
    '@type': 'image',
    url,
  };
  return [id, block];
}

export const extractImages = (editor, path) => {
  const images = [];
  const imageNodes = Array.from(
    Editor.nodes(editor, {
      at: path,
      match: (node) => node.type === IMAGE,
    }),
  );
  imageNodes.forEach(([el, path]) => {
    images.push(el);
    Transforms.removeNodes(editor, { at: path });
  });

  return images.map((el) => syncCreateImageBlock(el.src));
};
