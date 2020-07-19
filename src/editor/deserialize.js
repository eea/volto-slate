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

  const { nodeName } = el;
  console.log('n', nodeName);

  if (htmlTagsToSlate[nodeName]) {
    return htmlTagsToSlate[nodeName](editor, el);
  }

  // fallback deserializer
  let parent = el;
  const children = Array.from(parent.childNodes)
    .map((el) => deserialize(editor, el))
    .flat();

  return children;
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

export const blockTagDeserializer = (tagname) => (editor, el) => {
  let parent = el;

  const children = Array.from(parent.childNodes)
    .map((el) => deserialize(editor, el))
    .flat();
  const attrs = { type: tagname };

  console.log('element', attrs);
  return jsx('element', attrs, children);
};

export const bodyTagDeserializer = (editor, el) => {
  let parent = el;

  const children = Array.from(parent.childNodes)
    .map((el) => deserialize(editor, el))
    .flat();

  console.log('fragment (body)');
  return jsx('fragment', {}, children);
};

export const inlineTagDeserializer = (attrs) => (editor, el) => {
  let parent = el;

  const children = Array.from(parent.childNodes)
    .map((el) => deserialize(editor, el))
    .flat();

  return children.map((child) => {
    console.log('text child', attrs);
    return jsx('text', attrs, child);
  });
};
