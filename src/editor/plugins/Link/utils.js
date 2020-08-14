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

export const wrapLink = (editor, url, data) => {
  if (isActiveLink(editor)) {
    unwrapLink(editor);
  }

  const selection = editor.selection || editor.savedSelection;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: LINK,
    url,
    children: isCollapsed ? [{ text: url }] : [],
    data,
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

export const insertLink = (editor, url, data) => {
  const selection = editor.selection || editor.savedSelection;
  if (selection) {
    wrapLink(editor, url, data);
  }
};
