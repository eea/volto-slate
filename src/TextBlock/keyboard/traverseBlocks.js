import { isCursorAtBlockStart, isCursorAtBlockEnd } from 'volto-slate/utils';

// TODO: test for modifier key (ctrl)

export function goUp({ editor, event }) {
  if (isCursorAtBlockStart(editor)) {
    const props = editor.getBlockProps();
    const { onFocusPreviousBlock, block, blockNode } = props;
    onFocusPreviousBlock(block, blockNode.current);
  }
}

export function goDown({ editor, event }) {
  if (isCursorAtBlockEnd(editor)) {
    const props = editor.getBlockProps();
    const { onFocusNextBlock, block, blockNode } = props;
    onFocusNextBlock(block, blockNode.current);
  }
}
