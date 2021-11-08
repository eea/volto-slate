/* eslint no-console: ["error", { allow: ["error", "warn"] }] */
import { Editor, Transforms } from 'slate'; // Range, RangeRef
import config from '@plone/volto/registry';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import _ from 'lodash';

// case sensitive; first in an inner array is the default and preffered format
// in that array of formats
const formatAliases = [
  ['strong', 'b'],
  ['em', 'i'],
  ['del', 's'],
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
