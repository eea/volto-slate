import { serializeNodesToText } from 'volto-slate/editor/render';
import { Editor } from 'slate';
import {
  // isCursorInList,
  getPreviousVoltoBlock,
  getNextVoltoBlock,
  isCursorAtBlockStart,
  isCursorAtBlockEnd,
  mergeSlateWithBlockBackward,
  mergeSlateWithBlockForward,
} from 'volto-slate/utils';

/**
 * Joins the current block with the previous block to make a single block.
 * @param {Editor} editor
 * @param {KeyboardEvent} event
 */
export function joinWithPreviousBlock({ editor, event }) {
  // TODO: read block values not from editor properties, but from block
  // properties

  // The join takes place only when the cursor is at the beginning of the current block.
  if (!isCursorAtBlockStart(editor)) return;

  // From here on, the cursor is surely at the start of the current block.
  const blockProps = editor.getBlockProps();
  const {
    block,
    index,
    saveSlateBlockSelection,
    onChangeBlock,
    onDeleteBlock,
    onSelectBlock,
  } = blockProps;

  const { formContext } = editor;
  const formProperties = formContext.contextData.formData;

  // Get the previous Volto block.
  const [otherBlock = {}, otherBlockId] = getPreviousVoltoBlock(
    index,
    formProperties,
  );

  // If the previous block is not Slate Text, do nothing.
  if (otherBlock['@type'] !== 'slate') return;

  // From here on, the previous block is surely Slate Text.
  event.stopPropagation();
  event.preventDefault();

  // If the Editor contains no characters
  const text = Editor.string(editor, []);
  if (!text) {
    // we're dealing with an empty paragraph, no sense in merging
    const cursor = getBlockEndAsRange(otherBlock);
    // Set the selection of the previous block to be collapsed at the end of the previous block.
    saveSlateBlockSelection(otherBlockId, cursor);

    // TODO: is this setTimeout call necessary around the calls in its received function? In another place in this file we deleted it.
    setTimeout(() => {
      // Delete the current Volto block of type Slate Text that is just an empty paragraph
      onDeleteBlock(block, false).then(() => {
        // Then select the previous block.
        onSelectBlock(otherBlockId);
      });
    }, 10);

    // Stop the handler and mark the event as handled.
    return true;
  }

  // Else the editor contains characters, so we merge the current block's `editor` with the block before, `otherBlock`.
  mergeSlateWithBlockBackward(editor, otherBlock);

  // const selection = JSON.parse(JSON.stringify(editor.selection));
  const combined = JSON.parse(JSON.stringify(editor.children));

  // TODO: don't remove undo history, etc
  // Should probably save both undo histories, so that the blocks are split,
  // the undos can be restored??

  // Set the selection of the previous block to be collapsed at the end of the previous block.
  const cursor = getBlockEndAsRange(otherBlock);
  saveSlateBlockSelection(otherBlockId, cursor);

  onChangeBlock(otherBlockId, {
    '@type': 'slate',
    value: combined,
    plaintext: serializeNodesToText(combined || []),
  }).then(() => {
    onDeleteBlock(block, false).then(() => {
      onSelectBlock(otherBlockId);
    });
  });

  return true;
}

export function joinWithNextBlock({ editor, event }) {
  // TODO: read block values not from editor properties, but from block
  // properties

  if (!isCursorAtBlockEnd(editor)) return;

  const blockProps = editor.getBlockProps();
  const {
    block,
    index,
    saveSlateBlockSelection,
    onChangeBlock,
    onDeleteBlock,
    onSelectBlock,
  } = blockProps;

  const { formContext } = editor;
  const properties = formContext.contextData.formData;

  const [otherBlock = {}, otherBlockId] = getNextVoltoBlock(index, properties);

  if (otherBlock['@type'] !== 'slate') return;

  event.stopPropagation();
  event.preventDefault();

  mergeSlateWithBlockForward(editor, otherBlock);

  const selection = JSON.parse(JSON.stringify(editor.selection));
  const combined = JSON.parse(JSON.stringify(editor.children));

  // TODO: don't remove undo history, etc
  // Should probably save both undo histories, so that the blocks are split,
  // the undos can be restored??
  // TODO: after Enter, the current filled-with-previous-block
  // block is visible for a fraction of second

  const cursor = selection;
  saveSlateBlockSelection(otherBlockId, cursor);

  // setTimeout ensures setState has been successfully executed in Form.jsx.
  // See https://github.com/plone/volto/issues/1519
  setTimeout(() => {
    onChangeBlock(otherBlockId, {
      '@type': 'slate',
      value: combined,
      plaintext: serializeNodesToText(combined || []),
    });
    setTimeout(() => {
      onDeleteBlock(block, false);
      onSelectBlock(otherBlockId);
    });
  });

  return true;
}

/*
 * Join current block with neighbor block, if the blocks are compatible.
 */
export function joinWithNeighborBlock(
  getNeighborVoltoBlock,
  getCursorPosition,
  isValidOp,
  mergeOp,
) {
  return ({ editor, event }) => {
    // TODO: read block values not from editor properties, but from block
    // properties
    const blockProps = editor.getBlockProps();
    const {
      block,
      index,
      saveSlateBlockSelection,
      onChangeBlock,
      onDeleteBlock,
      onSelectBlock,
    } = blockProps;

    const { formContext } = editor;
    const properties = formContext.contextData.formData;

    const [otherBlock = {}, otherBlockId] = getNeighborVoltoBlock(
      index,
      properties,
    );

    if (!isValidOp(editor)) return;

    if (otherBlock['@type'] !== 'slate') return;

    event.stopPropagation();
    event.preventDefault();

    mergeOp(editor, otherBlock);

    const selection = JSON.parse(JSON.stringify(editor.selection));
    const combined = JSON.parse(JSON.stringify(editor.children));

    // TODO: don't remove undo history, etc
    // Should probably save both undo histories, so that the blocks are split,
    // the undos can be restored??
    // TODO: after Enter, the current filled-with-previous-block
    // block is visible for a fraction of second

    const cursor = getCursorPosition(otherBlock, selection);
    saveSlateBlockSelection(otherBlockId, cursor);

    // setTimeout ensures setState has been successfully executed in Form.jsx.
    // See https://github.com/plone/volto/issues/1519
    setTimeout(() => {
      onChangeBlock(otherBlockId, {
        '@type': 'slate',
        value: combined,
        plaintext: serializeNodesToText(combined || []),
      });
      setTimeout(() => {
        onDeleteBlock(block, false);
        onSelectBlock(otherBlockId);
      });
    });

    return true;
  };
}

function getBlockEndAsRange(block) {
  const { value } = block;
  const location = [value.length - 1];
  const editor = { children: value };
  const path = Editor.last(editor, location)[1];
  const [leaf, leafpath] = Editor.leaf(editor, path);
  const offset = (leaf.text || '').length;
  return {
    anchor: { path: leafpath, offset },
    focus: { path: leafpath, offset },
  };
}
