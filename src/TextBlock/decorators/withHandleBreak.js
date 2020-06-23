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

import { Range, Transforms, Path, Node } from 'slate';

const thereIsNoListItemBelowSelection = (editor) => {
  let sel = editor.selection;
  if (Range.isExpanded(sel)) {
    Transforms.collapse(editor, { edge: 'start' });
  }
  // Path of list-item
  let p = Path.parent(sel.anchor.path);
  // Path of numbered/bulleted list
  let pp = Path.parent(p);

  let listItems = Node.children(editor, pp);

  for (let [node, path] of listItems) {
    if (Path.isAfter(path, p)) {
      return false;
    }
  }

  return true;
};

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
          if (thereIsNoListItemBelowSelection(editor)) {
            simulateBackspaceAtEndOfEditor(editor);
            const bottomBlockValue = createDefaultFragment();
            createAndSelectNewBlockAfter(bottomBlockValue);
          } else {
            let [upBlock, bottomBlock] = splitEditorInTwoFragments(editor);

            // TODO: set `type` property values for each of the new blocks data below
            // (find out the parent list type: numbered or bulleted)
            let newUpBlock = [
              {
                children: upBlock[0].children.slice(
                  0,
                  upBlock[0].children.length - 1,
                ),
              },
            ];

            let newBottomBlock = [
              {
                children: bottomBlock[0].children.slice(
                  1,
                  bottomBlock[0].children.length,
                ),
              },
            ];

            console.log('newUpBlock', newUpBlock);
            console.log('newBottomBlock', newBottomBlock);

            replaceAllContentInEditorWith(editor, newUpBlock);
            createAndSelectNewBlockAfter(newBottomBlock);
          }
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
