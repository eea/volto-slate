import { Editor, Transforms, Text } from 'slate'; // Range, RangeRef
import { settings } from '~/config';

/**
 * Is it text? Is it whitespace (space, newlines, tabs) ?
 *
 */
export const isWhitespace = (c) => {
  return (
    typeof c === 'string' &&
    c.replace(/\s/g, '').replace(/\t/g, '').replace(/\n/g, '').length === 0
  );
};

export function normalizeBlockNodes(editor, children) {
  const nodes = [];
  let inlinesBlock = null;

  const isInline = (n) =>
    typeof n === 'string' || Text.isText(n) || editor.isInline(n);

  children.forEach((node) => {
    if (!isInline(node)) {
      inlinesBlock = null;
      nodes.push(node);
    } else {
      node = typeof node === 'string' ? { text: node } : node;
      if (!inlinesBlock) {
        inlinesBlock = createDefaultBlock([node]);
        nodes.push(inlinesBlock);
      } else {
        inlinesBlock.children.push(node);
      }
    }
  });
  return nodes;
}

export function createDefaultBlock(children) {
  return {
    type: settings.slate.defaultBlockType,
    children: children || [{ text: '' }],
  };
}

export function createEmptyParagraph() {
  // TODO: rename to createEmptyBlock
  return {
    type: settings.slate.defaultBlockType,
    children: [{ text: '' }],
  };
}

export const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });

  return !!match;
};

export const toggleInlineFormat = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  if (isActive) {
    const rangeRef = Editor.rangeRef(editor, editor.selection);

    Transforms.unwrapNodes(editor, {
      match: (n) => n.type === format,
      split: false,
    });

    const newSel = JSON.parse(JSON.stringify(rangeRef.current));

    Transforms.select(editor, newSel);
    editor.setSavedSelection(newSel);
    // editor.savedSelection = newSel;
    return;
  }
  const block = { type: format, children: [] };
  Transforms.wrapNodes(editor, block, { split: true });
};
