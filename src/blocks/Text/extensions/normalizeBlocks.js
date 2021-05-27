import { Text, Transforms, Element, Node } from 'slate';
import config from '@plone/volto/registry';
import { deconstructToVoltoBlocks } from 'volto-slate/utils';

export const normalizeBlocks = (editor) => {
  // enforce list rules (no block elements, only ol/ul/li as possible children
  const { normalizeNode } = editor;
  const { slate } = config.settings;
  const validListElements = [...slate.listTypes, slate.listItemType];

  editor.normalizeNode = (entry) => {
    let isNormalizing = false;

    if (!editor.voltoBlockNormalizing) {
      editor.voltoBlockNormalizing = true;
      isNormalizing = true;
    }

    const [node, path] = entry;

    if (
      !Text.isText(node) &&
      Element.isElement(node) &&
      !editor.isInline(node) &&
      !validListElements.includes(node.type) &&
      path.length > 1
    ) {
      console.log('not inline', node, path);
      // Transforms.liftNodes(editor, { at: path, split: true });
      //
      // for (const [child, childPath] of Node.children(editor, path)) {
      //   if (!validListElements.includes(child.type)) {
      //     Transforms.liftNodes(editor, { at: childPath, split: true });
      //     return;
      //   }
      // }
    }
    // if (node.type === 'ol' || node.type === 'ul') {
    //   if (Element.isElement(node) && slate.listTypes.includes(node.type)) {
    //     for (const [child, childPath] of Node.children(editor, path)) {
    //       if (!validListElements.includes(child.type)) {
    //         Transforms.liftNodes(editor, { at: childPath, split: true });
    //         return;
    //       }
    //     }
    //   }
    // }

    // if (node.type === slate.listItemType) {
    //   console.log('node', node);
    // }

    normalizeNode(entry);

    if (isNormalizing) {
      editor.voltoBlockNormalizing = undefined;
      // console.log('deconstruct', editor);
      // deconstructToVoltoBlocks(editor);
    }
  };

  return editor;
};
