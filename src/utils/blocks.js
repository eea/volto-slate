/* eslint no-console: ["error", { allow: ["error", "warn"] }] */
import { Editor, Transforms, Text } from 'slate'; // Range, RangeRef
import config from '@plone/volto/registry';
import { deconstructToVoltoBlocks } from 'volto-slate/utils';
import _ from 'lodash';

// case sensitive; first in an inner array is the default and preffered format
// in that array of formats
const formatAliases = [
  ['strong', 'b'],
  ['em', 'i'],
];

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
  const block = { type: defaultFormat, children: [] };
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

  if (isListItem && !wantsList) {
    toggleFormatAsListItem(editor, format);
  } else if (isListItem && wantsList && !isActive) {
    switchListType(editor, format); // this will deconstruct to Volto blocks
  } else if (!isListItem && wantsList) {
    changeBlockToList(editor, format);
  } else if (!isListItem && !wantsList) {
    toggleFormat(editor, format);
  } else {
    console.warn('toggleBlock case not covered, please examine:', {
      wantsList,
      isActive,
      isListItem,
    });
  }
};

/*
 * Applies a block format unto a list item. Will split the list and deconstruct the
 * block
 */
export const toggleFormatAsListItem = (editor, format) => {
  const { slate } = config.settings;

  // const pathRef = Editor.pathRef(editor, editor.selection);

  // Transforms.unwrapNodes(editor, {
  //   match: (n) => slate.listTypes.includes(n.type),
  //   split: true,
  //   mode: 'all',
  // });

  Transforms.setNodes(editor, {
    type: format,
  });

  Editor.normalize(editor);

  // Transforms.unwrapNodes(editor, {
  //   match: (n) => n.type === slate.listItemType,
  //   split: true,
  // });

  // console.log('toggleFormatAsListItem', JSON.parse(JSON.stringify(pathRef)));

  deconstructToVoltoBlocks(editor);
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

  deconstructToVoltoBlocks(editor);
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
