import { Editor, Transforms } from 'slate'; // Range,
import { FOOTNOTE } from 'volto-slate/constants';

export function insertFootnote(editor, data) {
  if (editor.savedSelection) {
    const selection = editor.savedSelection;

    // if (!editor.selection) {
    //   Transforms.select(editor, selection);
    // }
    // console.log('selection', JSON.stringify(selection));
    // const selPathRef = Editor.pathRef(editor, selection.anchor.path);

    const res = Array.from(
      Editor.nodes(editor, {
        match: (n) => n.type === FOOTNOTE,
        mode: 'highest',
        at: selection,
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
      Transforms.wrapNodes(
        editor,
        { type: FOOTNOTE, data },
        { split: true, at: selection },
      );
    }
    // Transforms.select(editor, selPathRef.current);
    // Transforms.collapse(editor, { edge: 'end' });
  }
}
export const unwrapFootnote = (editor) => {
  const selection = editor.selection || editor.savedSelection;
  Transforms.unwrapNodes(editor, {
    match: (n) => n.type === FOOTNOTE,
    at: selection,
  });
};

export const isActiveFootnote = (editor) => {
  const selection = editor.selection || editor.savedSelection;
  const [note] = Editor.nodes(editor, {
    match: (n) => n.type === FOOTNOTE,
    at: selection,
  });

  return !!note;
};

export const getActiveFootnote = (editor) => {
  const selection = editor.selection || editor.savedSelection;
  const [node] = Editor.nodes(editor, {
    match: (n) => n.type === FOOTNOTE,
    at: selection,
  });
  return node;
};
