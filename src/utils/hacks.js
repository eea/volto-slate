import { ReactEditor } from 'slate-react';
import { Editor, Transforms, Node } from 'slate';

export const fixSelection = (editor, event, defaultSelection) => {
  // This makes the Backspace key work properly in block.
  // Don't remove it, unless this test passes:
  // - with the Slate block unselected, click in the block.
  // - Hit backspace. If it deletes, then the test passes
  // console.log('fix selection', defaultSelection);

  if (!editor.selection) {
    if (defaultSelection) {
      if (defaultSelection === 'start') {
        const [, path] = Node.first(editor, []);
        const newSel = {
          anchor: { path, offset: 0 },
          focus: { path, offset: 0 },
        };
        return Transforms.select(editor, newSel);
      }
      if (defaultSelection === 'end') {
        const [leaf, path] = Node.last(editor, []);
        const newSel = {
          anchor: { path, offset: (leaf.text || '').length },
          focus: { path, offset: (leaf.text || '').length },
        };
        Transforms.select(editor, newSel);
      }
      return Transforms.select(editor, defaultSelection);
    }

    const sel = window.getSelection();

    if (sel) {
      if (sel.type === 'None') {
        const [leaf, path] = Node.last(editor, []);
        const newSel = {
          anchor: { path, offset: (leaf.text || '').length },
          focus: { path, offset: (leaf.text || '').length },
        };
        Transforms.select(editor, newSel);
      } else {
        const s = ReactEditor.toSlateRange(editor, sel);
        console.log('s', s);
        Transforms.select(editor, s);
      }
    }
  }
};
//
// try {
//   const s = ReactEditor.toSlateRange(editor, sel);
//   // console.log(event);
//   Transforms.select(editor, s);
// } catch {
//   console.log('error s', sel, editor.getBlockProps().block);
//   console.log('error', editor.children);
//   // console.log('error sel', sel);
// }
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
