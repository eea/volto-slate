import { jsx } from 'slate-hyperscript';
import { LINK } from 'volto-slate/constants';
import { deserialize } from 'volto-slate/editor/deserialize';
// import { Editor } from 'slate';

/**
 * This is almost the inverse function of LinkElement render function at
 * src/editor/plugins/Link/render.jsx
 * @param {Editor} editor
 * @param {HTMLElement} el
 */
export const linkDeserializer = (editor, el) => {
  let parent = el;

  const children = Array.from(parent.childNodes)
    .map((el) => deserialize(editor, el))
    .flat();

  const attrs = {
    type: LINK,
    url: el.getAttribute('href'),
    data: {},
  };

  if (el.hasAttribute('title')) attrs.data.title = el.getAttribute('title');

  // We don't use this isExternalLink because links can come w/o a target from
  // outside of Volto Slate blocks and still be external.
  // let isExternalLink;
  if (
    el.hasAttribute('target') &&
    ['_blank', '_self', '_parent', '_top'].includes(el.getAttribute('target'))
  ) {
    attrs.data = attrs.data || {};
    attrs.data.link = attrs.data.link || {};
    attrs.data.link.external = { target: el.getAttribute('target') };
    // isExternalLink = true;
  } else {
    // isExternalLink = false;
  }

  if (attrs.url?.startsWith('mailto:')) {
    // TODO: improve security because we are using regex-es
    attrs.data = attrs.data || {};
    attrs.data.link = attrs.data.link || {};
    attrs.data.link.email = {
      email_address: attrs.url
        .replace(/^mailto:/g, '')
        .replace(/\?subject=.+$/g, ''),
    };

    const subject = attrs.url.match(/\?subject=(.*)$/);
    if (subject && subject[1]) {
      attrs.data.link.email.email_subject = subject[1];
    }
  } else if (/* !isExternalLink &&  */ attrs.url?.startsWith('/')) {
    // TODO: improve this condition if it is not very good
    attrs.data = attrs.data || {};
    attrs.data.link = attrs.data.link || {};
    attrs.data.link.internal = { internal_link: [{ '@id': attrs.url }] };
  } else {
    // the general condition: if it is external link
    attrs.data = attrs.data || {};
    attrs.data.link = attrs.data.link || {};
    attrs.data.link.external = attrs.data.link.external || {};
    attrs.data.link.external.external_link = attrs.url;
  }

  return jsx('element', attrs, children);
};
