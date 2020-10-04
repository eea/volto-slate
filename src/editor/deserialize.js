import { jsx } from 'slate-hyperscript';
import { Text } from 'slate';

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

export const deserialize = (editor, el) => {
  const { htmlTagsToSlate } = editor;

  // console.log('des:', el.nodeType, el);
  if (el.nodeType === TEXT_NODE) {
    return el.textContent === '\n'
      ? ' '
      : el.textContent.replace(/\n$/g, ' ').replace(/\n/g, ' ');
  } else if (el.nodeType !== ELEMENT_NODE) {
    return null;
  } else if (el.nodeName === 'BR') {
    // TODO: handle <br> ?
    return null;
  }

  if (el.getAttribute('data-slate-data')) {
    return typeDeserialize(editor, el);
  }

  const { nodeName } = el;

  if (htmlTagsToSlate[nodeName]) {
    return htmlTagsToSlate[nodeName](editor, el);
  }

  return deserializeChildren(el, editor); // fallback deserializer
};

export const typeDeserialize = (editor, el) => {
  const jsData = el.getAttribute('data-slate-data');
  const { type, data } = JSON.parse(jsData);
  return jsx('element', { type, data }, deserializeChildren(el, editor));
};

export const deserializeChildren = (parent, editor) =>
  Array.from(parent.childNodes)
    .map((el) => deserialize(editor, el))
    .flat();

export const blockTagDeserializer = (tagname) => (editor, el) => {
  let children = deserializeChildren(el, editor);

  // normalizes block elements so that they're never empty
  const hasValidChildren = children.find((c) => !!c);
  if (!(editor.isInline(el) || editor.isVoid(el)) && !hasValidChildren) {
    children = [{ text: '' }];
  }

  return jsx('element', { type: tagname }, children);
};

export const bodyTagDeserializer = (editor, el) => {
  return jsx('fragment', {}, deserializeChildren(el, editor));
};

export const inlineTagDeserializer = (attrs) => (editor, el) => {
  return deserializeChildren(el, editor).map((child) => {
    const res =
      Text.isText(child) || typeof child === 'string'
        ? jsx('text', attrs, child)
        : {
            ...child,
            attrs, // pass the inline attrs as separate object
          };
    return res;
  });
};

export const spanTagDeserializer = (editor, el) => {
  const style = el.getAttribute('style') || '';
  const children = deserializeChildren(el, editor);

  // TODO: handle sub/sup as <sub> and <sup>
  // Handle Google Docs' <sub> formatting
  if (style.replace(/\s/g, '').indexOf('vertical-align:sub') > -1) {
    const attrs = { sub: true };
    return children.map((child) => {
      return jsx('text', attrs, child);
    });
  }

  // Handle Google Docs' <sup> formatting
  if (style.replace(/\s/g, '').indexOf('vertical-align:super') > -1) {
    const attrs = { sup: true };
    return children.map((child) => {
      return jsx('text', attrs, child);
    });
  }

  return children;
};

export const bTagDeserializer = (editor, el) => {
  // Google Docs does weird things with <b> tag
  return (el.getAttribute('id') || '').indexOf('docs-internal-guid') > -1
    ? deserializeChildren(el, editor)
    : jsx('element', { type: 'b' }, deserializeChildren(el, editor));
};

export const preTagDeserializer = (editor, el) => {
  // Based on Slate example implementation. Replaces <pre> tags with <code>.
  // Comment: I don't know how good of an idea is this. I'd rather have two
  // separate formats: "preserve whitespace" and "code". This feels like a hack
  const { nodeName } = el;
  let parent = el;

  if (el.childNodes[0] && el.childNodes[0].nodeName === 'CODE') {
    parent = el.childNodes[0];
  }

  return blockTagDeserializer(nodeName)(editor, parent);
};
