import { jsx } from 'slate-hyperscript';
import { LINK } from 'volto-slate/constants';
import { deserialize } from 'volto-slate/editor/deserialize';

export const linkDeserializer = (editor, el) => {
  let parent = el;

  const children = Array.from(parent.childNodes)
    .map((el) => deserialize(editor, el))
    .flat();

  console.log('link', el, children);

  const attrs = {
    type: LINK,
    url: el.getAttribute('href'),
  };

  return jsx('element', attrs, children);
};
