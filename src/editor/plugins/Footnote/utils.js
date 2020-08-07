import { Editor, Transforms } from 'slate';
import { FOOTNOTE } from 'volto-slate/constants';

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
  Transforms.unwrapNodes(editor, { match: (n) => n.type === FOOTNOTE });
};

export const isActiveFootnote = (editor) => {
  const [note] = Editor.nodes(editor, { match: (n) => n.type === FOOTNOTE });

  return !!note;
};

export const getActiveFootnote = (editor) => {
  const [node] = Editor.nodes(editor, { match: (n) => n.type === FOOTNOTE });
  return node;
};
