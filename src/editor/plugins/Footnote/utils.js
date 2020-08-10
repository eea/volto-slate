import { Editor, Transforms } from 'slate'; // Range,
import { FOOTNOTE } from 'volto-slate/constants';

// export const wrapFootnote = (editor, data) => {
//   if (isActiveFootnote(editor)) {
//     unwrapFootnote(editor);
//   }
//
//   const { selection } = editor;
//   const isCollapsed = selection && Range.isCollapsed(selection);
//   const footnote = {
//     type: FOOTNOTE,
//     data,
//   };
//
//   if (isCollapsed) {
//     Transforms.insertNodes(editor, { ...footnote, children: [{ text: '' }] });
//   } else {
//     Transforms.wrapNodes(editor, footnote, { split: true });
//     Transforms.collapse(editor, { edge: 'end' });
//   }
// };
//
// export function insertFootnote(editor, data) {
//   if (editor.selection) {
//     wrapFootnote(editor, data);
//   }
// }

export function insertFootnote(editor, data) {
  if (editor.savedSelection) {
    const { savedSelection: j_s } = editor;
    const selection = JSON.parse(j_s);

    if (!editor.selection) {
      Transforms.select(editor, selection);
    }

    const res = Array.from(
      Editor.nodes(editor, {
        match: (n) => n.type === FOOTNOTE,
        mode: 'highest',
      }),
    );

    if (res.length) {
      const [, path] = res[0];
      Transforms.setNodes(
        editor,
        { data },
        {
          at: path ? path : null,
          match: path ? (n) => n.type === FOOTNOTE : null,
        },
      );
      // Transforms.collapse(editor, { edge: 'end' });
    } else {
      Transforms.wrapNodes(editor, { type: FOOTNOTE, data }, { split: true });
    }
  }
}
export const unwrapFootnote = (editor) => {
  const selection =
    (editor.savedSelection && JSON.parse(editor.savedSelection)) ||
    editor.selection;
  Transforms.unwrapNodes(editor, {
    match: (n) => n.type === FOOTNOTE,
    at: selection,
  });
};

export const isActiveFootnote = (editor) => {
  const selection =
    (editor.savedSelection && JSON.parse(editor.savedSelection)) ||
    editor.selection;
  const [note] = Editor.nodes(editor, {
    match: (n) => n.type === FOOTNOTE,
    at: selection,
  });

  return !!note;
};

export const getActiveFootnote = (editor) => {
  const selection =
    (editor.savedSelection && JSON.parse(editor.savedSelection)) ||
    editor.selection;
  const [node] = Editor.nodes(editor, {
    match: (n) => n.type === FOOTNOTE,
    at: selection,
  });
  return node;
};
