import { blockTagDeserializer } from 'volto-slate/editor/deserialize';
import { Editor } from 'slate';

/**
 * This extension just replaces the `<h1>` tag deserializer with the one for `<h2>` tags. The rest of the default deserializers inherited from the `SlateEditor` component are good already.
 * @param {Editor} editor The Slate editor object to extend.
 */
export const withDeserializers = (editor) => {
  editor.htmlTagsToSlate = {
    ...editor.htmlTagsToSlate,

    // We don't want H1 tags when pasting, we rewrite them as H2
    H1: blockTagDeserializer('h2'),
  };

  return editor;
};
