import { blockTagDeserializer } from 'volto-slate/editor/deserialize';

// import { settings } from '~/config';

// export const deserializeListTag = (tagname) => (editor, el) => {
//   console.log('list', el);
//   return '';
// };
//
// export const deserializeListItemTag = (editor, el) => {
//   console.log('listitem', el);
//   return '';
// };

export const withDeserializers = (editor) => {
  editor.htmlTagsToSlate = {
    ...editor.htmlTagsToSlate,
    H1: blockTagDeserializer('h2'),
    // UL: deserializeListTag('ul'),
    // OL: deserializeListTag('ol'),
    // LI: deserializeListItemTag,
  };

  return editor;
};
