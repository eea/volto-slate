import { jsx } from 'slate-hyperscript';
import { Transforms } from 'slate';

const ELEMENT_TAGS = {
  A: (el) => ({ type: 'link', url: el.getAttribute('href') }),
  BLOCKQUOTE: () => ({ type: 'block-quote' }),
  H1: () => ({ type: 'heading-two' }),
  H2: () => ({ type: 'heading-two' }),
  H3: () => ({ type: 'heading-three' }),
  H4: () => ({ type: 'heading-three' }),
  H5: () => ({ type: 'heading-three' }),
  H6: () => ({ type: 'heading-three' }),
  // IMG: (el) => ({ type: 'image', url: el.getAttribute('src') }),
  LI: () => ({ type: 'list-item' }),
  OL: () => ({ type: 'numbered-list' }),
  P: () => ({ type: 'paragraph' }),
  // TODO: functionality exists, but toolbar button does not, so commented this out:
  // PRE: () => ({ type: 'code' }),
  UL: () => ({ type: 'bulleted-list' }),
};

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
};

export const deserialize = (el) => {
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
  let parent = el;

  if (
    nodeName === 'PRE' &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === 'CODE'
  ) {
    parent = el.childNodes[0];
  }
  const children = Array.from(parent.childNodes).map(deserialize).flat();

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    return jsx('element', attrs, children);
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    return children.map((child) => jsx('text', attrs, child));
  }

  return children;
};

const withDeserializeHtml = (editor) => {
  const { insertData } = editor;

  // editor.isInline = (element) => {
  //   return element.type === 'link' ? true : isInline(element);
  // };

  // editor.isVoid = (element) => {
  //   return element.type === 'image' ? true : isVoid(element);
  // };

  const inlineTypes = ['link'];

  editor.insertData = (data) => {
    const html = data.getData('text/html');

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');

      const fragment = deserialize(parsed.body);

      const firstNodeType = fragment[0].type;

      // replace the selected node type by the first block type
      if (firstNodeType && !inlineTypes.includes(firstNodeType)) {
        Transforms.setNodes(editor, { type: fragment[0].type });
      }
      Transforms.insertNodes(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};

export default withDeserializeHtml;
