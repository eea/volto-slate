import { settings } from '~/config';

export const withDeserializers = (editor) => {
  // Saving a copy of these deserializers in the editor makes possible to have
  // different deserializers per editor
  //
  // For example, for the TextBlock deserializer we exclude h1,h4,h5,h6 tags
  // and handle lists very differently

  const { slate } = settings;

  editor.htmlTagsToSlate = slate.htmlTagsToSlate;

  return editor;
};
