import { Text, Transforms, Element } from 'slate';
import config from '@plone/volto/registry';

export const normalizeBlocks = (editor) => {
  // enforce list rules (no block elements, only ol/ul/li as possible children
  const { normalizeNode } = editor;
  const { slate } = config.settings;
  const specialRuledElements = [
    ...slate.listTypes,
    slate.listItemType,
    ...slate.tableTypes,
  ];

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // delete childless ul/ol nodes
    if (
      !Text.isText(node) &&
      Element.isElement(node) &&
      !editor.isInline(node) &&
      slate.listTypes.includes(node.type)
    ) {
      if ((node.children || []).length === 0) {
        Transforms.removeNodes(editor, { at: path });
        return;
      }
    }

    // TODO: skip table nodes
    if (
      !Text.isText(node) &&
      Element.isElement(node) &&
      !editor.isInline(node) &&
      !specialRuledElements.includes(node.type) &&
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
