export default function saveSlateBlockSelection(blockid, selection) {
  return {
    type: 'SAVE_SLATE_BLOCK_SELECTION',
    blockid,
    selection,
  };
}
