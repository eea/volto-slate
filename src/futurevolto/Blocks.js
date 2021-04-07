// eslint-disable-next-line no-console
console.warn(
  'DEPRECATED: volto-slate/futurevolto/Blocks. Moved to `@plone/volto/helpers`',
);
export {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
  hasBlocksData,
  blockHasValue,
  getBlocks,
  moveBlock,
  deleteBlock,
  addBlock,
  mutateBlock,
  changeBlock,
  nextBlockId,
  previousBlockId,
  emptyBlocksForm,
} from '@plone/volto/helpers';
