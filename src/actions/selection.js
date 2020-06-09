export default function setSlateBlockSelection(blockid, selection) {
  return {
    type: 'SET_SLATE_BLOCK_SELECTION',
    blockid,
    selection,
  };
}
