import { Editor, Transforms, Range } from 'slate';
import { LINK } from 'volto-slate/constants';

export const getActiveLink = (editor) => {
  const selection = editor.selection || editor.savedSelection;
  const [node] = Editor.nodes(editor, {
    match: (n) => n.type === LINK,
    at: selection,
  });
  return node;
};

export const isActiveLink = (editor) => {
  const selection = editor.selection || editor.savedSelection;
  const [link] = Editor.nodes(editor, {
    match: (n) => n.type === LINK,
    at: selection,
  });

  return !!link;
};

export const unwrapLink = (editor) => {
  const selection = editor.selection || editor.savedSelection;
  Transforms.select(editor, selection);
  Transforms.unwrapNodes(editor, {
    match: (n) => n.type === LINK,
    at: selection,
  });
};

export const insertLink = (editor, url, data) => {

  if (isActiveLink(editor)) {
    unwrapLink(editor);
  }

  if (editor.savedSelection) {
    // wrapLink(editor, url, data);

    const selection = editor.selection || editor.savedSelection;
    const selPathRef = Editor.pathRef(editor, selection.anchor.path);
    const isCollapsed = selection && Range.isCollapsed(selection);

    const link = {
      type: LINK,
      url,
      children: isCollapsed ? [{ text: url }] : [],
      data,
    };

    const res = Array.from(
      Editor.nodes(editor, {
        match: (n) => n.type === LINK,
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
          match: path ? (n) => n.type === LINK : null,
        },
      );
    } else {
      Transforms.wrapNodes(
        editor,
        link,
        { split: true, at: selection },
      );
    }

    if (data) {
      Transforms.select(editor, selPathRef.current);
      Transforms.collapse(editor, { edge: 'end' });
    }
  }
};
