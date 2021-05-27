import { Text, Transforms, Element } from 'slate';
import config from '@plone/volto/registry';

export const normalizeBlocks = (editor) => {
  // enforce list rules (no block elements, only ol/ul/li as possible children
  const { normalizeNode } = editor;
  const { slate } = config.settings;
  const validListElements = [...slate.listTypes, slate.listItemType];

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (
      !Text.isText(node) &&
      Element.isElement(node) &&
      !editor.isInline(node) &&
      !validListElements.includes(node.type) &&
      path.length > 1
    ) {
      // Insert a space in the first element
      const at = path[path.length] > 0 ? [...path, 0] : [...path, path.length];
      Transforms.insertNodes(editor, { text: ' ' }, { at, mode: 'lowest' });
      Transforms.unwrapNodes(editor, { at: path });

      return;
    }
    normalizeNode(entry);
  };

  return editor;
};
