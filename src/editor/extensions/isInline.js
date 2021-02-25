import config from '@plone/volto/registry';

export const isInline = (editor) => {
  const { isInline } = editor;
  const { slate } = config.settings;

  editor.isInline = (element) => {
    return slate.inlineElements.includes(element.type)
      ? true
      : isInline(element);
  };

  return editor;
};
