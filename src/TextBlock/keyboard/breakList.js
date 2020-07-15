import { Range, Node } from 'slate';
import { settings } from '~/config';
import {
  splitEditorInTwoFragments,
  setEditorContent,
  createAndSelectNewBlockAfter,
} from 'volto-slate/utils';

export function breakList({ editor, event }) {
  // if selection is collapsed and cursor is at beginning of list item

  const { slate } = settings;

  if (editor.selection && Range.isCollapsed(editor.selection)) {
    const { anchor } = editor.selection;
    // const node = Node.leaf(editor, anchor.path);    // TODO: may throw
    const parent = Node.parent(editor, anchor.path);

    if (parent.type !== slate.listItemType || anchor.offset > 0) {
      return;
    }

    const [top, bottom] = splitEditorInTwoFragments(editor);
    setEditorContent(editor, top);
    createAndSelectNewBlockAfter(editor, bottom);
  }
  return true;
}
