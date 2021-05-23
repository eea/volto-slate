import { SIMPLELINK } from 'volto-slate/constants';

export const withSimpleLink = (editor) => {
  // const { insertData, insertText, isInline } = editor;

  const { isInline } = editor;

  editor.isInline = (element) => {
    return element.type === SIMPLELINK ? true : isInline(element);
  };

  // editor.insertText = (text) => {
  //   if (text && isUrl(text)) {
  //     wrapLink(editor, text);
  //   } else {
  //     insertText(text);
  //   }
  // };
  //
  // editor.insertData = (data) => {
  //   const text = data.getData('text/plain');
  //
  //   if (text && isUrl(text)) {
  //     wrapLink(editor, text);
  //   } else {
  //     insertData(data);
  //   }
  // };
  return editor;
};
