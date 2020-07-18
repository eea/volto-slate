import { jsx } from 'slate-hyperscript';
import { LINK } from './constants';
import { deserialize } from 'volto-slate/editor/deserialize';

export const linkDeserializer = (editor, el) => {
  let parent = el;

  const children = Array.from(parent.childNodes)
    .map((el) => deserialize(editor, el))
    .flat();

  const attrs = {
    type: LINK,
    url: el.getAttribute('href'),
  };

  return jsx('element', attrs, children);
};
