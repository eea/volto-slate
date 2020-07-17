import { Editor, Path, Range, Transforms } from 'slate';
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

    const nops = Array.from(
      Editor.nodes(editor, {
        match: (node) => node.type === 'nop',
        at: anchor.path,
      }),
    );
    if (nops) {
      // Break the nop into two, identify parent listitem, create a sibling for
      // it and move the second node to that
      event.preventDefault();
      event.stopPropagation();
      const [, nopPath] = nops[0];
      const [listItem, listItemPath] = Editor.parent(editor, nopPath);
      Transforms.splitNodes(editor, {
        always: true,
      });
      Transforms.insertNodes(
        editor,
        {
          type: listItem.type,
          children: [{ text: '' }],
        },
        { at: listItemPath },
      );
      const newListItemPath = Path.next(listItemPath);
      const newNopPath = [...newListItemPath, 0];
      Transforms.moveNodes(editor, {
        at: newNopPath,
        to: [...listItemPath, 0],
        mode: 'lowest',
        match: (node) => node.type === 'nop',
      });
      return true;
    }

    const [parent] = Editor.parent(editor, anchor.path);
    if (parent.type !== slate.listItemType || anchor.offset > 0) {
      return; // applies default behaviour, as defined in insertBreak.js extension
    }

    event.preventDefault();
    event.stopPropagation();

    // TODO: while this is interesting as a tech demo, I'm not sure that this
    // is what we really want, to be able to break lists in two separate blocks

    Editor.deleteBackward(editor, { unit: 'line' });
    const [top, bottom] = splitEditorInTwoFragments(editor);
    setEditorContent(editor, top);
    createAndSelectNewBlockAfter(editor, bottom);

    return true;
  }
}
