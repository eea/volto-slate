import { ReactEditor } from 'slate-react';

export const fixSelection = (editor) => {
  // This makes the Backspace key work properly in block.
  // Don't remove it, unless this test passes:
  // - with the Slate block unselected, click in the block.
  // - Hit backspace. If it deletes, then the test passes

  if (!editor.selection) {
    const sel = window.getSelection();

    if (sel) {
      const s = ReactEditor.toSlateRange(editor, sel);
      editor.selection = s;
    }

    // TODO: in unit tests (jsdom) sel is null
    // See also discussions in https://github.com/ianstormtaylor/slate/pull/3652
    // console.log('fixing selection', JSON.stringify(sel), editor.selection);
    // sel.collapse(
    //   sel.focusNode,
    //   sel.anchorOffset > 0 ? sel.anchorOffset - 1 : 0,
    // );
    // sel.collapse(
    //   sel.focusNode,
    //   sel.anchorOffset > 0 ? sel.anchorOffset + 1 : 0,
    // );
  }
};
