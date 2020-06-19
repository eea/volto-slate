import {
  createAndSelectNewSlateBlock,
  blockEntryAboveSelection,
  listEntryAboveSelection,
  emptyListEntryAboveSelection,
  simulateBackspaceAtEndOfEditor,
  createDefaultFragment,
  splitEditorInTwoFragments,
  replaceAllContentInEditorWith,
} from '../utils';

const withHandleBreak = (index, onAddBlock, onChangeBlock, onSelectBlock) => (
  editor,
) => {
  const { insertBreak: defaultInsertBreak } = editor;

  const createAndSelectNewBlockAfter = (blockValue) => {
    return createAndSelectNewSlateBlock(blockValue, index, {
      onChangeBlock,
      onAddBlock,
      onSelectBlock,
    });
  };

  editor.insertBreak = () => {
    if (blockEntryAboveSelection(editor)) {
      if (listEntryAboveSelection(editor)) {
        if (emptyListEntryAboveSelection(editor)) {
          simulateBackspaceAtEndOfEditor(editor);
          const bottomBlockValue = createDefaultFragment();
          createAndSelectNewBlockAfter(bottomBlockValue);
        } else {
          defaultInsertBreak();
        }
      } else {
        const [upBlock, bottomBlock] = splitEditorInTwoFragments(editor);
        replaceAllContentInEditorWith(editor, upBlock);
        createAndSelectNewBlockAfter(bottomBlock);
      }
    }
  };

  return editor;
};

export default withHandleBreak;
