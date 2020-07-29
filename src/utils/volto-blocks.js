import { v4 as uuid } from 'uuid';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import { Transforms, Editor, Node } from 'slate';
import { serializeNodesToText } from 'volto-slate/editor/render';
import { omit } from 'lodash';
import { IMAGE } from 'volto-slate/constants';

function fromEntries(pairs) {
  const res = {};
  pairs.forEach((p) => {
    res[p[0]] = p[1];
  });
  return res;
}

// TODO: should be made generic, no need for "prevBlock.value"
export function mergeSlateWithBlockBackward(editor, prevBlock, event) {
  // To work around current architecture limitations, read the value from
  // previous block. Replace it in the current editor (over which we have
  // control), join with current block value, then use this result for previous
  // block, delete current block
  //

  const prev = prevBlock.value;

  // collapse the selection to its start point
  Transforms.collapse(editor, { edge: 'start' });

  // insert the contents of the previous editor into the current editor
  Transforms.insertNodes(editor, prev, {
    at: Editor.start(editor, []),
  });

  Editor.deleteBackward(editor, { unit: 'character' });
}

export function mergeSlateWithBlockForward(editor, nextBlock, event) {
  // To work around current architecture limitations, read the value from next
  // block. Replace it in the current editor (over which we have control), join
  // with current block value, then use this result for next block, delete
  // current block

  const next = nextBlock.value;

  // collapse the selection to its start point
  Transforms.collapse(editor, { edge: 'end' });
  Transforms.insertNodes(editor, next, {
    at: Editor.end(editor, []),
  });

  Editor.deleteForward(editor, { unit: 'character' });
}

export function createSlateBlock(value, { index, onChangeBlock, onAddBlock }) {
  return new Promise((resolve) => {
    onAddBlock('slate', index + 1).then((id) => {
      const options = {
        '@type': 'slate',
        value: JSON.parse(JSON.stringify(value)),
        plaintext: serializeNodesToText(value),
      };
      onChangeBlock(id, options).then(() => resolve(id));
    });
  });
}

export function syncCreateSlateBlock(value) {
  const id = uuid();
  const block = {
    '@type': 'slate',
    value: JSON.parse(JSON.stringify(value)),
    plaintext: serializeNodesToText(value),
  };
  return [id, block];
}

export function createImageBlock(url, index, { onChangeBlock, onAddBlock }) {
  const block = {
    '@type': 'image',
    url,
  };
  return new Promise((resolve) => {
    onAddBlock('slate', index + 1).then((id) => {
      onChangeBlock(id, block).then(resolve(id));
    });
  });
}

export function syncCreateImageBlock(url) {
  const id = uuid();
  const block = {
    '@type': 'image',
    url,
  };
  return [id, block];
}

export const createAndSelectNewBlockAfter = (editor, blockValue) => {
  const blockProps = editor.getBlockProps();
  const { onSelectBlock } = blockProps;
  createSlateBlock(blockValue, blockProps).then((id) => onSelectBlock(id));
};

export function getNextVoltoBlock(index, properties) {
  // TODO: look for any next slate block
  // join this block with previous block, if previous block is slate
  const blocksFieldname = getBlocksFieldname(properties);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);

  const blocks_layout = properties[blocksLayoutFieldname];

  if (index === blocks_layout.items.length) return;

  const nextBlockId = blocks_layout.items[index + 1];
  const nextBlock = properties[blocksFieldname][nextBlockId];

  return [nextBlock, nextBlockId];
}

export function getPreviousVoltoBlock(index, properties) {
  // TODO: look for any prev slate block
  if (index === 0) return;

  const blocksFieldname = getBlocksFieldname(properties);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);

  const blocks_layout = properties[blocksLayoutFieldname];
  const prevBlockId = blocks_layout.items[index - 1];
  const prevBlock = properties[blocksFieldname][prevBlockId];

  return [prevBlock, prevBlockId];
}

function createVoltoImages(editor, blocks) {
  // console.log('BEGIN createVoltoImages: blocks = ', blocks);

  for (const [, path] of Node.children(editor, [])) {
    const pathRef = Editor.pathRef(editor, path);
    const images = [];

    // Discover and emit images as separate Volto image blocks
    const imageNodes = Array.from(
      Editor.nodes(editor, {
        at: path,
        match: (node) => node.type === IMAGE,
      }),
    );
    imageNodes.forEach(([el, path]) => {
      images.push(el);
      Transforms.removeNodes(editor, { at: path });
    });

    const [childNode] = Editor.node(editor, pathRef.current);

    if (childNode && !Editor.isEmpty(editor, childNode))
      blocks.push(syncCreateSlateBlock([childNode]));

    images.forEach((el) => {
      blocks.push(syncCreateImageBlock(el.url));
    });
  }

  // console.log('END createVoltoImages: blocks = ', blocks);
}

function processBlocks(
  editor,
  blocks,
  blockProps,
  resolve,
  keepCurrentBlock = true,
) {
  const { formContext } = editor;
  const { contextData, setContextData } = formContext;
  const { formData } = contextData;
  const blocksFieldname = getBlocksFieldname(formData);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(formData);

  const { index } = blockProps;
  const blockids = blocks.map((b) => b[0]);

  let layout = [
    ...formData[blocksLayoutFieldname].items.slice(0, index),
    ...blockids,
    ...formData[blocksLayoutFieldname].items.slice(index),
  ];

  if (!keepCurrentBlock) {
    layout = layout.filter((id) => id !== blockProps.block);
  }

  // TODO: add the placeholder block, because we remove it (because we remove
  // the current block)

  let formDataBlocks = {
    ...formData[blocksFieldname],
    ...fromEntries(blocks),
  };

  if (!keepCurrentBlock) {
    formDataBlocks = omit(formDataBlocks, blockProps.block);
  }

  const data = {
    ...contextData,
    formData: {
      ...formData,
      [blocksFieldname]: formDataBlocks,
      [blocksLayoutFieldname]: {
        ...formData[blocksLayoutFieldname],
        items: layout,
      },
    },
    selected: blockids[blockids.length - 1],
  };

  console.log('result of deconstructToVoltoBlocks:', data);

  setContextData(data).then(() => resolve(blockids));
}

export function deconstructToVoltoBlocks(editor) {
  // Explodes editor content into separate blocks
  // If the editor has multiple top-level children, split the current block
  // into multiple slate blocks. This will delete and replace the current
  // block.
  //
  // It returns a promise that, when resolved, will pass a list of Volto block
  // ids that were affected
  //
  // For the Volto blocks manipulation we do low-level changes to the context
  // form state, as that ensures a better performance (no un-needed UI updates)

  console.log('deconstructToVoltoBlocks CALLED');
  const blockProps = editor.getBlockProps();

  return new Promise((resolve, reject) => {
    // one child which is a Slate block of type non-image
    // if (editor.children.length === 1 && editor.children[0].type !== 'image') {
    //   return resolve([blockProps.block]);
    // }

    // one child which is a Slate block that is of type image
    // so leave it there and transform it into a Volto Image block
    if (editor.children.length === 1) {
      // convert it to a Volto image block
      let blocks = [];
      createVoltoImages(editor, blocks);
      console.log('ONE SLATE IMAGE TO BECOME VOLTO IMAGE', blocks);
      return processBlocks(editor, blocks, blockProps, resolve, false);
    }

    // more than one child, do the break of the blocks that are images
    let blocks = [];
    createVoltoImages(editor, blocks);
    return processBlocks(editor, blocks, blockProps, resolve);
  });
}
