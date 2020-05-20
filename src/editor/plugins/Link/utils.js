import { Editor, Transforms, Range } from 'slate';
import { LINK } from './constants';

export const isLinkActive = (editor) => {
  const [link] = Editor.nodes(editor, { match: (n) => n.type === LINK });
  return !!link;
};

export const unwrapLink = (editor) => {
  Transforms.unwrapNodes(editor, { match: (n) => n.type === LINK });
};

export const wrapLink = (editor, url, data) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
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
  if (editor.selection) {
    wrapLink(editor, url, data);
  }
};
