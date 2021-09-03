import { Transforms, Element, Node } from 'slate';
import config from '@plone/volto/registry';

export const withLists = (editor) => {
  // enforce list rules (no block elements, only ol/ul/li as possible children)

  // const { normalizeNode } = editor;
  // const { slate } = config.settings;
  // const validListElements = [...slate.listTypes, slate.listItemType];
  //
  // editor.normalizeNode = (entry) => {
  //   const [node, path] = entry;
  //
  //   // const isElementNode = Element.isElement(node);
  //   // const isListTypeNode = slate.listTypes.includes(node.type);
  //   //
  //   // if (isElementNode && isListTypeNode) {
  //   //   // lift all child nodes of ul/ol that are not ul/ol/li
  //   //   for (const [child, childPath] of Node.children(editor, path)) {
  //   //     if (!validListElements.includes(child.type)) {
  //   //       Transforms.liftNodes(editor, { at: childPath, split: true });
  //   //
  //   //       // const newParent = { type: slate.defaultBlockType, children: [] };
  //   //       // Transforms.wrapNodes(editor, newParent, { at: childPath });
  //   //       return;
  //   //     }
  //   //   }
  //   // }
  //
  //   try {
  //     normalizeNode(entry);
  //   } catch {
  //     // eslint-disable-next-line
  //     console.log('Error in normalizing', entry);
  //   }
  // };

  return editor;
};
