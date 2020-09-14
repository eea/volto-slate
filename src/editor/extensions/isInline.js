import { settings } from '~/config';

export const isInline = (editor) => {
  const { isInline } = editor;
  const { slate } = settings;

  editor.isInline = (element) => {
    return slate.inlineElements.includes(element.type)
      ? true
      : isInline(element);
  };

  return editor;
};
