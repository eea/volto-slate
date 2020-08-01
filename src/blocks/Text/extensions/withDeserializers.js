import { blockTagDeserializer } from 'volto-slate/editor/deserialize';

export const withDeserializers = (editor) => {
  editor.htmlTagsToSlate = {
    ...editor.htmlTagsToSlate,

    // We don't want H1 tags when pasting, we rewrite them as H2
    H1: blockTagDeserializer('h2'),
  };

  return editor;
};
