import { Editor, Range, Node } from 'slate';
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
    const parent = Node.parent(editor, anchor.path);

    if (parent.type !== slate.listItemType || anchor.offset > 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    Editor.deleteBackward(editor, { unit: 'line' });
    const [top, bottom] = splitEditorInTwoFragments(editor);
    setEditorContent(editor, top);
    createAndSelectNewBlockAfter(editor, bottom);

    // TODO: we need to fix the first child, in case we've dealt with deep
    // lists
  }
  return true;
}
