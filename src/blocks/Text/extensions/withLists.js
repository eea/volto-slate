import { Transforms, Element, Node } from 'slate';
import config from '@plone/volto/registry';

export const withLists = (editor) => {
  // enforce list rules (no block elements, only ol/ul/li as possible children
  const { normalizeNode } = editor;
  const { slate } = config.settings;
  const validListElements = [...slate.listTypes, slate.listItemType];

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (Element.isElement(node)) {
      if (slate.listTypes.includes(node.type)) {
        // lift all child nodes of ul/ol that are not ul/ol/li
        for (const [child, childPath] of Node.children(editor, path)) {
          if (!validListElements.includes(child.type)) {
            Transforms.liftNodes(editor, { at: childPath, split: true });
            return;
          }
        }
      } else {
        const liNodes = Array.from(Node.children(node, [])).filter(
          ([n, p]) => n.type === slate.listItemType,
        );
        console.log('lis', liNodes);

        // if a node has a <li> but isn't an ul/ol, unwrap the <li>
        // // check if <li> has ul/ol parent
        // console.log('check', node, path, editor.children);
        // let parent;
        // parent = Node.parent(editor.children, path);
        // if (!slate.listTypes.includes(parent.type)) {
        //   [parent] = Node.ancestors(editor.children, path, {
        //     reverse: true,
        //   }).find(([n, p]) => {
        //     return slate.listTypes.includes(n.type);
        //   });
        //
        //   console.log('parent', parent);
        //   // Transforms.
        // }
        //
        // // try {
        // // }
      }
    }

    // if (node.type === 'ol' || node.type === 'ul') { }
    // if (node.type === slate.listItemType) {
    //   console.log('node', node);
    // }
    // console.log('normalizing', entry);

    try {
      normalizeNode(entry);
    } catch {
      console.log('Error in normalizing', entry);
    }
  };

  return editor;
};
