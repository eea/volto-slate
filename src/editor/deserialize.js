import { jsx } from 'slate-hyperscript';
// import { settings } from '~/config';
import { Editor, Node } from 'slate';

/**
 * @summary Should be called with care since it can return many types of data: null, string, array, array of arrays, and even more depending on `htmlTagsToSlate` settings.
 * @param {Editor} editor The Slate Editor into which to deserialize.
 * @param {HTMLElement} el The HTML element to deserialize.
 * @returns {Node[][] | Node[]} If the `el` is a `<table>` in a `<google-sheets-html-origin>` the return value is for sure an array with a Slate Node with type 'table'. If the `el` is a `<body>` the return value is for sure an array with a single `Node[]` (Slate fragment) in it.
 */
export const deserialize = (editor, el) => {
  const { htmlTagsToSlate } = editor;

  if (el.nodeType === 3) {
    // TEXT_NODE

    // Trimming similar to how the browser does when displaying text nodes:
    const nv = el.nodeValue?.trim();
    const tc = el.textContent.trim();

    // The old way of doing it, was not working with spaces in text nodes between table cells (td/th):
    // return nv === '\n' ? null : tc;

    return nv.length === 0 ? null : tc;
  } else if (el.nodeType !== 1) {
    // !== ELEMENT_NODE
    return null;
  } else if (el.nodeName === 'BR') {
    return '\n';
  }

  // console.log('n', `-${el.nodeValue}-`, el.nodeType, el.nodeName);

  const { nodeName } = el;

  if (htmlTagsToSlate[nodeName]) {
    return [htmlTagsToSlate[nodeName](editor, el)];
  }

  // fallback deserializer
  return deserializeChildren(el, editor);
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

export const deserializeChildren = (parent, editor) =>
  Array.from(parent.childNodes)
    .map((el) => deserialize(editor, el))
    .flat();

export const blockTagDeserializer = (tagname) => (editor, el) => {
  return jsx('element', { type: tagname }, deserializeChildren(el, editor));
};

export const bodyTagDeserializer = (editor, el) => {
  return jsx('fragment', {}, deserializeChildren(el, editor));
};

export const inlineTagDeserializer = (attrs) => (editor, el) => {
  return deserializeChildren(el, editor).map((child) => {
    return jsx('text', attrs, child);
  });
};

export const spanTagDeserializer = (editor, el) => {
  const style = el.getAttribute('style') || '';
  const children = deserializeChildren(el, editor);

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
