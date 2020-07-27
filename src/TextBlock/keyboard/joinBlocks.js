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

export function joinWithPreviousBlock({ editor, event }) {
  // TODO: read block values not from editor properties, but from block
  // properties

  if (!isCursorAtBlockStart(editor)) return;
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

  const [otherBlock = {}, otherBlockId] = getPreviousVoltoBlock(
    index,
    properties,
  );

  if (otherBlock['@type'] !== 'slate') return;

  event.stopPropagation();
  event.preventDefault();

  const text = Editor.string(editor, []);
  if (!text) {
    // we're dealing with an empty paragraph, no sense in merging
    const cursor = getBlockEndAsRange(otherBlock);
    saveSlateBlockSelection(otherBlockId, cursor);

    setTimeout(() => {
      onDeleteBlock(block, false);
      onSelectBlock(otherBlockId);
    }, 10);
    return true;
  }

  mergeSlateWithBlockBackward(editor, otherBlock);

  // const selection = JSON.parse(JSON.stringify(editor.selection));
  const combined = JSON.parse(JSON.stringify(editor.children));

  // TODO: don't remove undo history, etc
  // Should probably save both undo histories, so that the blocks are split,
  // the undos can be restored??
  // TODO: after Enter, the current filled-with-previous-block
  // block is visible for a fraction of second

  const cursor = getBlockEndAsRange(otherBlock);
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
    }, 10);
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
