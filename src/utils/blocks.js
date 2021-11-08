/* eslint no-console: ["error", { allow: ["error", "warn"] }] */
import { Editor, Transforms, Node, createEditor, Text, Element } from 'slate'; // Range, RangeRef
import config from '@plone/volto/registry';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import _ from 'lodash';
import { normalizeNode } from 'volto-slate/editor/extensions/normalizeNode';

// case sensitive; first in an inner array is the default and preffered format
// in that array of formats
const formatAliases = [
  ['strong', 'b'],
  ['em', 'i'],
  ['del', 's'],
];

/**
 * The default editor.normalizeNode implementation, modified to put Text's
 * inside p-s when they are directly inside the root node of the editor.
 * @param {*} editor
 * @returns
 */
export const generateNormalizeNode = (editor) => (entry) => {
  const [node, path] = entry;

  // There are no core normalizations for text nodes.
  if (Text.isText(node)) {
    return;
  }

  // Ensure that block and inline nodes have at least one text child.
  if (Element.isElement(node) && node.children.length === 0) {
    const child = { text: '' };
    Transforms.insertNodes(editor, child, {
      at: path.concat(0),
      voids: true,
    });
    return;
  }

  // Determine whether the node should have block or inline children.
  const shouldHaveInlines = Editor.isEditor(node)
    ? false
    : Element.isElement(node) &&
      (editor.isInline(node) ||
        node.children.length === 0 ||
        Text.isText(node.children[0]) ||
        editor.isInline(node.children[0]));

  // Since we'll be applying operations while iterating, keep track of an
  // index that accounts for any added/removed nodes.
  let n = 0;

  for (let i = 0; i < node.children.length; i++, n++) {
    const currentNode = Node.get(editor, path);
    if (Text.isText(currentNode)) continue;
    const child = node.children[i];
    const prev = currentNode.children[n - 1];
    const isLast = i === node.children.length - 1;
    const isInlineOrText =
      Text.isText(child) ||
      (Element.isElement(child) && editor.isInline(child));

    // Only allow block nodes in the top-level children and parent blocks
    // that only contain block nodes. Similarly, only allow inline nodes in
    // other inline nodes, or parent blocks that only contain inlines and
    // text.
    if (isInlineOrText !== shouldHaveInlines) {
      // The pasted content can have Text-s directly inside the root, so we do
      // not remove these Text-s but wrap them inside a 'p'.
      if (isInlineOrText && child.text !== '') {
        Transforms.wrapNodes(
          editor,
          // TODO: should here be an empty Text inside children?
          { type: 'p', children: [] },
          {
            at: path.concat(n),
            voids: true,
          },
        );
      } else {
        Transforms.removeNodes(editor, {
          at: path.concat(n),
          voids: true,
        });
        --n;
      }
    } else if (Element.isElement(child)) {
      // Ensure that inline nodes are surrounded by text nodes.
      if (editor.isInline(child)) {
        if (prev == null || !Text.isText(prev)) {
          const newChild = { text: '' };
          Transforms.insertNodes(editor, newChild, {
            at: path.concat(n),
            voids: true,
          });
          n++;
        } else if (isLast) {
          const newChild = { text: '' };
          Transforms.insertNodes(editor, newChild, {
            at: path.concat(n + 1),
            voids: true,
          });
          n++;
        }
      }
    } else {
      // Merge adjacent text nodes that are empty or match.
      if (prev != null && Text.isText(prev)) {
        if (Text.equals(child, prev, { loose: true })) {
          Transforms.mergeNodes(editor, { at: path.concat(n), voids: true });
          n--;
        } else if (prev.text === '') {
          Transforms.removeNodes(editor, {
            at: path.concat(n - 1),
            voids: true,
          });
          n--;
        } else if (child.text === '') {
          Transforms.removeNodes(editor, {
            at: path.concat(n),
            voids: true,
          });
          n--;
        }
      }
    }
  }
};

export const normalizeExternalData = (editor, nodes, asInRoot = true) => {
  const [a] = Editor.above(editor, {
    match: (n) => Editor.isBlock(editor, n),
  });

  const type = a.type;

  let fakeEditor = createEditor();
  fakeEditor.children = asInRoot ? nodes : [{ type, children: nodes }];
  fakeEditor.isInline = editor.isInline;
  fakeEditor.isVoid = editor.isVoid;
  fakeEditor.fake = true;
  fakeEditor.normalizeNode = generateNormalizeNode(fakeEditor);
  fakeEditor = normalizeNode(fakeEditor);

  if (fakeEditor.children.some((o) => Editor.isBlock(fakeEditor, o))) {
    Array.from(Node.children(fakeEditor, [])).forEach((v, i, a) => {
      if (!Editor.isBlock(fakeEditor, v)) {
        Transforms.wrapNodes(
          fakeEditor,
          { type: 'p' },
          {
            at: [i],
          },
        );
      }
    });
  }

  Editor.normalize(fakeEditor, { force: true });

  return fakeEditor.children;
};

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

export function createDefaultBlock(children) {
  return {
    type: config.settings.slate.defaultBlockType,
    children: children || [{ text: '' }],
  };
}

export function createEmptyParagraph() {
  // TODO: rename to createEmptyBlock
  return {
    type: config.settings.slate.defaultBlockType,
    children: [{ text: '' }],
  };
}

export const isSingleBlockTypeActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });

  return !!match;
};

export const isBlockActive = (editor, format) => {
  const aliasList = _.find(formatAliases, (x) => _.includes(x, format));

  if (aliasList) {
    const aliasFound = _.some(aliasList, (y) => {
      return isSingleBlockTypeActive(editor, y);
    });

    if (aliasFound) {
      return true;
    }
  }

  return isSingleBlockTypeActive(editor, format);
};

export const getBlockTypeContextData = (editor, format) => {
  let isActive, defaultFormat, matcher;

  const aliasList = _.find(formatAliases, (x) => _.includes(x, format));

  if (aliasList) {
    const aliasFound = _.some(aliasList, (y) => {
      return isSingleBlockTypeActive(editor, y);
    });

    if (aliasFound) {
      isActive = true;
      defaultFormat = _.first(aliasList);
      matcher = (n) => _.includes(aliasList, n.type);

      return { isActive, defaultFormat, matcher };
    }
  }

  isActive = isBlockActive(editor, format);
  defaultFormat = format;
  matcher = (n) => n.type === format;

  return { isActive, defaultFormat, matcher };
};

export const toggleInlineFormat = (editor, format) => {
  const { isActive, defaultFormat, matcher } = getBlockTypeContextData(
    editor,
    format,
  );

  if (isActive) {
    const rangeRef = Editor.rangeRef(editor, editor.selection);

    Transforms.unwrapNodes(editor, {
      match: matcher,
      split: false,
    });

    const newSel = JSON.parse(JSON.stringify(rangeRef.current));

    Transforms.select(editor, newSel);
    editor.setSavedSelection(newSel);
    // editor.savedSelection = newSel;
    return;
  }
  const block = { type: defaultFormat, children: [{ text: '' }] };
  Transforms.wrapNodes(editor, block, { split: true });
};

export const toggleBlock = (editor, format) => {
  // We have 6 boolean variables which need to be accounted for.
  // See https://docs.google.com/spreadsheets/d/1mVeMuqSTMABV2BhoHPrPAFjn7zUksbNgZ9AQK_dcd3U/edit?usp=sharing
  const { slate } = config.settings;
  const { listTypes } = slate;

  const isListItem = isBlockActive(editor, slate.listItemType);
  const isActive = isBlockActive(editor, format);
  const wantsList = listTypes.includes(format);
  // console.log({ isListItem, isActive, wantsList, format });

  if (isListItem && !wantsList) {
    toggleFormatAsListItem(editor, format);
  } else if (isListItem && wantsList && !isActive) {
    switchListType(editor, format);
  } else if (!isListItem && wantsList) {
    changeBlockToList(editor, format);
  } else if (!isListItem && !wantsList) {
    toggleFormat(editor, format);
  } else if (isListItem && wantsList && isActive) {
    toggleFormatAsListItem(editor, slate.defaultBlockType);
  } else {
    console.warn('toggleBlock case not covered, please examine:', {
      wantsList,
      isActive,
      isListItem,
    });
  }
};

/*
 * Applies a block format to a list item. Will split the list
 */
export const toggleFormatAsListItem = (editor, format) => {
  Transforms.setNodes(editor, {
    type: format,
  });

  Editor.normalize(editor);
};

/*
 * Toggles between list types by exploding the block
 */
export const switchListType = (editor, format) => {
  const { slate } = config.settings;
  Transforms.unwrapNodes(editor, {
    match: (n) => slate.listTypes.includes(n.type),
    split: true,
  });
  const block = { type: format, children: [] };
  Transforms.wrapNodes(editor, block);
};

export const changeBlockToList = (editor, format) => {
  const { slate } = config.settings;
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === slate.listItemType,
  });

  if (!match) {
    Transforms.setNodes(editor, {
      type: slate.listItemType,
      // id: nanoid(8),
    });
  }
  const block = { type: format, children: [] };
  Transforms.wrapNodes(editor, block);
};

export const toggleFormat = (editor, format) => {
  const { slate } = config.settings;
  const isActive = isBlockActive(editor, format);
  const type = isActive ? slate.defaultBlockType : format;
  Transforms.setNodes(editor, {
    type,
  });
};

/**
 * @param {object} properties A prop received by the View component
 *  which is read by the `getBlocksFieldname` and
 * `getBlocksLayoutFieldname` Volto helpers to produce the return value.
 * @returns {Array} All the blocks data taken from the Volto form.
 */
export const getAllBlocks = (properties, blocks) => {
  const blocksFieldName = getBlocksFieldname(properties);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);

  for (const n of properties?.[blocksLayoutFieldname]?.items || []) {
    const block = properties[blocksFieldName][n];
    // TODO Make this configurable via block config getBlocks
    if (
      block?.data?.[blocksLayoutFieldname] &&
      block?.data?.[blocksFieldName]
    ) {
      getAllBlocks(block.data, blocks);
    } else if (block?.[blocksLayoutFieldname] && block?.[blocksFieldName]) {
      getAllBlocks(block, blocks);
    }
    blocks.push({
      id: n,
      ...block,
    });
  }
  return blocks;
};
