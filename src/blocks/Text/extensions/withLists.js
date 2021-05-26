import { Transforms, Element, Node } from 'slate';
import config from '@plone/volto/registry';

export const withLists = (editor) => {
  // enforce list rules (no block elements, only ol/ul/li as possible children
  const { normalizeNode } = editor;
  const { slate } = config.settings;
  const validListElements = [...slate.listTypes, slate.listItemType];

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (Element.isElement(node) && slate.listTypes.includes(node.type)) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (!validListElements.includes(child.type)) {
          Transforms.liftNodes(editor, { at: childPath, split: true });
          return;
        }
      }
    }

    // if (node.type === 'ol' || node.type === 'ul') { }
    // if (node.type === slate.listItemType) {
    //   console.log('node', node);
    // }

    console.log('normalizing', entry);
    normalizeNode(entry);
  };

  return editor;
};
