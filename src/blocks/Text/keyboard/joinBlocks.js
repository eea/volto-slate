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
  // TODO: clarify if this special case really needs to be handled or not. In `joinWithNextBlock` it is not handled.
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

  // TODO: save the old selection of the current block, in which the cursor is, in case we can undo to it.
  // const selection = JSON.parse(JSON.stringify(editor.selection));

  // Clone the Slate document's nodes to insert them later into the previous block.
  const combined = JSON.parse(JSON.stringify(editor.children));

  // TODO: don't remove undo history, etc
  // Should probably save both undo histories, so that the blocks are split,
  // the undos can be restored??

  // Set the selection of the previous block to be collapsed at the end of the previous block.
  const cursor = getBlockEndAsRange(otherBlock);
  saveSlateBlockSelection(otherBlockId, cursor);

  // Put the combined block contents into the previous block.
  onChangeBlock(otherBlockId, {
    '@type': 'slate', // TODO: use a constant specified in src/constants.js instead of 'slate'
    value: combined,
    plaintext: serializeNodesToText(combined || []),
  }).then(() => {
    // Delete the current block.
    onDeleteBlock(block, false).then(() => {
      // Focus (select) the previous block which now contains the contents of both blocks.
      onSelectBlock(otherBlockId);
    });
  });

  // Mark the event as handled.
  return true;
}

/**
 * Joins the current block (which has the cursor) with the next block to make a single block.
 * @param {Editor} editor
 * @param {KeyboardEvent} event
 */
export function joinWithNextBlock({ editor, event }) {
  // TODO: read block values not from editor properties, but from block
  // properties

  // The join takes place only when the cursor is at the end of the current block.
  if (!isCursorAtBlockEnd(editor)) return;

  // From here on, the cursor is surely at the end of the current block.
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

  // Get the next Volto block.
  const [otherBlock = {}, otherBlockId] = getNextVoltoBlock(
    index,
    formProperties,
  );

  // If the next block is not Slate Text, do nothing. (TODO: use a constant instead of 'slate'.)
  if (otherBlock['@type'] !== 'slate') return;

  // From here on, the next block is surely Slate Text.
  event.stopPropagation();
  event.preventDefault();

  // The editor either contains characters or not, so we merge the current block's `editor` with the block after, `otherBlock`.
  mergeSlateWithBlockForward(editor, otherBlock);

  // Store the selection of the block that has the text cursor.
  const selection = JSON.parse(JSON.stringify(editor.selection));

  // Clone the Slate document's nodes to insert them later into the next block.
  const combined = JSON.parse(JSON.stringify(editor.children));

  // TODO: don't remove undo history, etc
  // Should probably save both undo histories, so that the blocks are split,
  // the undos can be restored??

  // The stored selection is set as the selection of the final (next) block because its contents begin with the contents of the block that has the text cursor.
  const cursor = selection;
  saveSlateBlockSelection(otherBlockId, cursor);

  // setTimeout ensures setState has been successfully executed in Form.jsx.
  // See https://github.com/plone/volto/issues/1519
  setTimeout(() => {
    // Put the combined block contents into the next block.
    onChangeBlock(otherBlockId, {
      '@type': 'slate', // TODO: use a constant specified in src/constants.js instead of 'slate'
      value: combined,
      plaintext: serializeNodesToText(combined || []),
    }).then(() => {
      // Delete the current block.
      onDeleteBlock(block, false).then(() => {
        // Focus (select) the next block which now contains the contents of both blocks.
        onSelectBlock(otherBlockId);
      });
    });
  });

  // Mark the event as handled.
  return true;
}

/**
 * Join current block with neighbor block, if the blocks are compatible.
 * @todo This seems to be dead code that should be removed or transformed into a combination of `joinWithPreviousBlock` and `joinWithNextBlock` which are written above.
 */
export function joinWithNeighborBlock(
  getNeighborVoltoBlock,
  getCursorPosition,
  isValidOp,
  mergeOp,
) {
  /**
   *
   */
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

/**
 * @param {object} block The Volto object representing the configuration and contents of a Volto Block of type Slate Text.
 * @returns {Range} The collapsed Slate Range that represents the last position the text cursor can take inside the given block.
 */
function getBlockEndAsRange(block) {
  // The value of the Slate Text Volto block.
  const { value } = block;
  // The Slate Path representing the last root-level Slate block inside the Volto block.
  const location = [value.length - 1];
  // The Slate Node that represents all the contents of the given Volto block.
  const editor = { children: value };
  // The path of the last Slate Node in the last Slate Path computed above.
  const path = Editor.last(editor, location)[1];
  // The last Text node (leaf node) entry inside the path computed just above.
  const [leaf, leafpath] = Editor.leaf(editor, path);
  // The offset of the Points in the collapsed Range computed below:
  const offset = (leaf.text || '').length;

  return {
    anchor: { path: leafpath, offset },
    focus: { path: leafpath, offset },
  };
}
