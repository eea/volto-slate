import { ReactEditor } from 'slate-react';
import { Editor, Transforms } from 'slate';

export const fixSelection = (editor, event, defaultSelection) => {
  // This makes the Backspace key work properly in block.
  // Don't remove it, unless this test passes:
  // - with the Slate block unselected, click in the block.
  // - Hit backspace. If it deletes, then the test passes
  console.log(event);

  if (!editor.selection) {
    if (defaultSelection) {
      Transforms.select(editor, defaultSelection);
      return;
    }

    const sel = window.getSelection();

    if (sel) {
      try {
        const s = ReactEditor.toSlateRange(editor, sel);
        console.log('error s', s);
        Transforms.select(editor, s);
      } catch {
        console.log('error', editor.children);
        console.log('error sel', sel);
      }
    }
  }
};
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
