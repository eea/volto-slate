import { Editor, Text, Transforms, Element } from 'slate';
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
  const listElements = [...slate.listTypes, slate.listItemType];

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

    let parent = {};
    try {
      if (
        !Text.isText(node) &&
        Element.isElement(node) &&
        !editor.isInline(node)
      ) {
        [parent] = Editor.parent(editor, path);
      }
    } catch (e) {
      console.log('error in getting parent', node);
    }

    // if the node is child in a list, but it's not a list node, lift the node
    if (
      slate.listTypes.includes(parent.type) &&
      !listElements.includes(node.type)
    ) {
      Transforms.liftNodes(editor, { at: path });
      // Transforms.wrapNodes(
      //   editor,
      //   { type: slate.listItemType, children: [] },
      //   { at: path },
      // );
      return;
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
