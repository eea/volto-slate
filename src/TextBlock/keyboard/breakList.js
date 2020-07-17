import { Editor, Path, Range, Transforms } from 'slate';
import { settings } from '~/config';
import {
  splitEditorInTwoFragments,
  setEditorContent,
  createAndSelectNewBlockAfter,
} from 'volto-slate/utils';

export function breakList({ editor, event }) {
  if (!(editor.selection && Range.isCollapsed(editor.selection))) return false;

  const { slate } = settings;
  const { anchor } = editor.selection;

  // look for div[@type='nop'] as these are special markers for inline list
  // item content
  const nops = Array.from(
    Editor.nodes(editor, {
      match: (node) => node.type === 'nop',
      at: anchor.path,
      reverse: true,
    }),
  );

  if (nops.length) {
    // Break the nop into two, identify parent listitem, create a sibling for
    // it and move the second node to that
    event.preventDefault();
    event.stopPropagation();

    const [, nopPath] = nops[0];
    const [listItem, listItemPath] = Editor.parent(editor, nopPath);

    // break the nop in 2
    Transforms.splitNodes(editor, {
      always: true,
    });

    // push down the current list item by inserting a new one at same path
    Transforms.insertNodes(
      editor,
      {
        type: listItem.type,
        children: [{ text: '' }],
      },
      { at: listItemPath },
    );

    // Transfer the first splitted nop to the old listitem location
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
  // is what we really want (break lists in two separate blocks)

  // Split the list in two separat Volto blocks
  // Currently it is buggy with sublists, and it's not clear to me which is the
  // best behaviour. In any case, this may be hard to "cleanup" and get to
  // a proper solution
  Editor.deleteBackward(editor, { unit: 'line' });
  const [top, bottom] = splitEditorInTwoFragments(editor);
  setEditorContent(editor, top);
  createAndSelectNewBlockAfter(editor, bottom);

  return true;
}
