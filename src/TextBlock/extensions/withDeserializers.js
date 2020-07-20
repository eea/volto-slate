// import { settings } from '~/config';

export const deserializeListTag = (tagname) => (editor, el) => {
  console.log('list', el);
  return '';
};

export const deserializeListItemTag = (editor, el) => {
  console.log('listitem', el);
  return '';
};

export const withDeserializers = (editor) => {
  editor.htmlTagsToSlate = {
    ...editor.htmlTagsToSlate,
    UL: deserializeListTag('ul'),
    OL: deserializeListTag('ol'),
    LI: deserializeListItemTag,
  };

  return editor;
};
