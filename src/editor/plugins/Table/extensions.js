import { blockTagDeserializer } from 'volto-slate/editor/deserialize';
import { TABLE, TR, TD, TFOOT, THEAD, TBODY, TH } from 'volto-slate/constants';

export const withTablePaste = (editor) => {
  editor.htmlTagsToSlate = {
    ...editor.htmlTagsToSlate,
    TABLE: blockTagDeserializer(TABLE),
    THEAD: blockTagDeserializer(THEAD),
    TFOOT: blockTagDeserializer(TFOOT),
    TBODY: blockTagDeserializer(TBODY),
    TR: blockTagDeserializer(TR),
    TH: blockTagDeserializer(TH),
    TD: blockTagDeserializer(TD),
  };

  return editor;
};
