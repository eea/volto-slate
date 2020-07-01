import isUrl from 'is-url';
import { wrapLink } from './utils';
// eslint-disable-next-line no-unused-vars
import { isImageUrl } from '../Image/decorators';

export const withLinks = (editor) => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = (element) => {
    return element.type === 'link' ? true : isInline(element);
  };

  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data) => {
    const text = data.getData('text/plain');

    if (text && isUrl(text) /* && !isImageUrl(text) */) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };
  return editor;
};
