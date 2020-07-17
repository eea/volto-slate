import { Editor, Range, Transforms } from 'slate';
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
    // const parent = Node.parent(editor, anchor.path);
    const [parent, parentPath] = Editor.parent(editor, anchor.path);

    const types = [slate.listItemType, 'nop'];
    if (!types.includes(parent.type) || anchor.offset > 0) {
      return; // applies default behaviour, as defined in insertBreak.js extension
    }

    event.preventDefault();
    event.stopPropagation();

    if (parent.type === 'nop') {
      const [, parentListItemPath] = Editor.parent(editor, parentPath);
      Transforms.insertNodes(
        editor,
        {
          type: slate.listItemType,
          children: [{ text: '' }],
        },
        {
          at: parentListItemPath,
        },
      );
      return true;
    }

    // TODO: while this is interesting as a tech demo, I'm not sure that this
    // is what we really want, to be able to break lists in two separate blocks

    Editor.deleteBackward(editor, { unit: 'line' });
    const [top, bottom] = splitEditorInTwoFragments(editor);
    setEditorContent(editor, top);
    createAndSelectNewBlockAfter(editor, bottom);

    return true;
  }
}
