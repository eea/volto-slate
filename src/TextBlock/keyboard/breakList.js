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
