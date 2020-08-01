import { Editor, Range, Transforms } from 'slate';
import { settings } from '~/config';
import {
  splitEditorInTwoFragments,
  setEditorContent,
  createAndSelectNewBlockAfter,
} from 'volto-slate/utils';

// Handles Enter on an empty list item
export const breakList = (editor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    if (!(editor.selection && Range.isCollapsed(editor.selection))) {
      insertBreak();
      return false;
    }

    const { slate } = settings;
    const { anchor } = editor.selection;

    // if one of the parents is a list item, break that list item
    const [listItem, listItemPath] = Editor.nodes(editor, {
      at: editor.selection,
      mode: 'lowest',
      match: (node) => node.type === slate.listItemType,
    });
    if (listItem) {
      if (Editor.string(editor, editor.selection)) {
        Transforms.splitNodes(editor, {
          at: listItemPath,
          match: (node) => node.type === slate.listItemType,
          always: true, // in case cursor is at end of line
        });

        return true;
      }
    }

    const [parent] = Editor.parent(editor, anchor.path);
    if (parent.type !== slate.listItemType || anchor.offset > 0) {
      insertBreak();
      return; // applies default behaviour, as defined in insertBreak.js extension
    }

    // TODO: while this is interesting as a tech demo, I'm not sure that this
    // is what we really want (break lists in two separate blocks)

    // Split the list in two separate Volto blocks
    Editor.deleteBackward(editor, { unit: 'line' });

    const [top, bottom] = splitEditorInTwoFragments(editor);
    setEditorContent(editor, top);
    createAndSelectNewBlockAfter(editor, bottom);

    return true;
  };

  return editor;
};
