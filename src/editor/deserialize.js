import { jsx } from 'slate-hyperscript';
// import { settings } from '~/config';

export const deserialize = (editor, el) => {
  const { htmlTagsToSlate } = editor;

  if (el.nodeType === 3) {
    // TEXT_NODE
    return el.nodeValue === '\n' ? null : el.textContent;
  } else if (el.nodeType !== 1) {
    // !== ELEMENT_NODE
    return null;
  } else if (el.nodeName === 'BR') {
    return '\n';
  }

  console.log('n', `-${el.nodeValue}-`, el.nodeType, el.nodeName);

  const { nodeName } = el;

  if (htmlTagsToSlate[nodeName]) {
    return htmlTagsToSlate[nodeName](editor, el);
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

export const spanDeserializer = (editor, el) => {
  const style = el.getAttribute('style') || '';
  const children = deserializeChildren(el, editor);

  // SUB
  if (style.replace(/\s/g, '').indexOf('vertical-align:sub') > -1) {
    const attrs = { sub: true };
    return children.map((child) => {
      return jsx('text', attrs, child);
    });
  }

  // SUP
  if (style.replace(/\s/g, '').indexOf('vertical-align:super') > -1) {
    const attrs = { sup: true };
    return children.map((child) => {
      return jsx('text', attrs, child);
    });
  }

  return children;
};
