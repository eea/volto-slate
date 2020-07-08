import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import { Transforms, Editor } from 'slate';
import { serializeNodesToText } from 'volto-slate/editor/render';

// TODO: should be made generic, no need for "prevBlock.value"
export function mergeSlateWithBlockBackward(editor, prevBlock, event) {
  // To work around current architecture limitations, read the value from
  // previous block. Replace it in the current editor (over which we have
  // control), join with current block value, then use this result for previous
  // block, delete current block

  const prev = prevBlock.value;

  // collapse the selection to its start point
  Transforms.collapse(editor, { edge: 'start' });

  // insert the contents of the previous editor into the current editor
  Transforms.insertNodes(editor, prev, {
    at: Editor.start(editor, []),
  });

  Editor.deleteBackward(editor, { unit: 'character' });
}

// TODO: should be made generic, no need for "nextBlock.value"
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

export function createAndSelectNewSlateBlock(
  value,
  index,
  { onChangeBlock, onAddBlock, onSelectBlock },
) {
  // add a new block
  const id = onAddBlock('slate', index + 1);

  // change the new block
  const options = {
    '@type': 'slate',
    value: JSON.parse(JSON.stringify(value)),
    plaintext: serializeNodesToText(value),
  };
  onChangeBlock(id, options);
  onSelectBlock(id);
  return id;
}

export const createAndSelectNewBlockAfter = (editor, blockValue) => {
  const blockProps = editor.getBlockProps();
  const { index, onChangeBlock, onSelectBlock, onAddBlock } = blockProps;
  return createAndSelectNewSlateBlock(blockValue, index, {
    onChangeBlock,
    onAddBlock,
    onSelectBlock,
  });
};

export function getNextBlock(index, properties) {
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

export function getPreviousBlock(index, properties) {
  // TODO: look for any prev slate block
  if (index === 0) return;

  const blocksFieldname = getBlocksFieldname(properties);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);

  const blocks_layout = properties[blocksLayoutFieldname];
  const prevBlockId = blocks_layout.items[index - 1];
  const prevBlock = properties[blocksFieldname][prevBlockId];

  return [prevBlock, prevBlockId];
}
