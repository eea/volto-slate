import { FOOTNOTE } from './constants';

export const withFootnote = (editor) => {
  const { isInline } = editor;

  editor.isInline = (element) => {
    return element.type === FOOTNOTE ? true : isInline(element);
  };

  return editor;
};
