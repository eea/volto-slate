import { jsx } from 'slate-hyperscript';
import { Text } from 'slate';
import {
  normalizeBlockNodes,
  isWhitespace,
  createEmptyParagraph,
} from 'volto-slate/utils';
import { TD, TH } from '../constants';

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;
const COMMENT = 8;

const INLINE_ELEMENTS = [
  'A',
  'ABBR',
  'ACRONYM',
  'AUDIO',
  'B',
  'BDI',
  'BDO',
  'BIG',
  'BR',
  'BUTTON',
  'CANVAS',
  'CITE',
  'CODE',
  'DATA',
  'DATALIST',
  'DEL',
  'DFN',
  'EM',
  'EMBED',
  'I',
  'IFRAME',
  'IMG',
  'INPUT',
  'INS',
  'KBD',
  'LABEL',
  'MAP',
  'MARK',
  'METER',
  'NOSCRIPT',
  'OBJECT',
  'OUTPUT',
  'PICTURE',
  'PROGRESS',
  'Q',
  'RUBY',
  'S',
  'SAMP',
  'SCRIPT',
  'SELECT',
  'SLOT',
  'SMALL',
  'SPAN',
  'STRONG',
  'SUB',
  'SUP',
  'SVG',
  'TEMPLATE',
  'TEXTAREA',
  'TIME',
  'U',
  'TT',
  'VAR',
  'VIDEO',
  'WBR',
];

// eslint-disable-next-line
const BLOCK_ELEMENTS = [
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'BLOCKQUOTE',
  'DETAILS',
  'DIALOG',
  'DD',
  'DIV',
  'DL',
  'DT',
  'FIELDSET',
  'FIGCAPTION',
  'FIGURE',
  'FOOTER',
  'FORM',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'HGROUP',
  'HR',
  'LI',
  'MAIN',
  'NAV',
  'OL',
  'P',
  'PRE',
  'SECTION',
  'TABLE',
  'UL',
];

const isInline = (node) =>
  node &&
  (node.nodeType === TEXT_NODE || INLINE_ELEMENTS.includes(node.nodeName));

/**
 * Deserializes to an object or an Array.
 */
export const deserialize = (editor, el) => {
  // console.log('deserialize el:', el);
  const { htmlTagsToSlate } = editor;

  // console.log('des:', el.nodeType, el);
  if (el.nodeType === COMMENT) {
    return null;
  } else if (el.nodeType === TEXT_NODE) {
    // instead of === '\n' we use isWhitespace for when deserializing tables
    // from Calc and other similar cases

    if (isWhitespace(el.textContent)) {
      // console.log({
      //   text: `-${el.textContent}-`,
      //   prev: el.previousSibling,
      //   next: el.nextSibling,
      //   isPrev: isInline(el.previousSibling),
      //   isNext: isInline(el.nextSibling),
      //   prevName: el.previousSibling && el.previousSibling.nodeName,
      //   nextName: el.nextSibling && el.nextSibling.nodeName,
      // });
      // if it's empty text between 2 tags, it should be ignored
      return isInline(el.previousSibling) || isInline(el.nextSibling)
        ? ' '
        : null;
    }
    return el.textContent
      .replace(/\n$/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\t/g, '');
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
  let children = deserializeChildren(el, editor).filter((n) => n !== null);

  if (
    [TD, TH].includes(tagname) &&
    children.length > 0 &&
    typeof children[0] === 'string'
  ) {
    // TODO: should here be handled the cases when there are more strings in
    // `children` or when there are besides strings other types of nodes too?
    const p = createEmptyParagraph();
    p.children[0].text = children[0];
    children = [p];
  }

  const isInline = (n) =>
    typeof n === 'string' || Text.isText(n) || editor.isInline(n);
  const hasBlockChild = children.filter((n) => !isInline(n)).length > 0;
  // const isCurrentInline = editor.isInline(el);

  if (hasBlockChild) {
    children = normalizeBlockNodes(editor, children);
  }

  // normalizes block elements so that they're never empty
  // Avoids a hard crash from the Slate editor
  const hasValidChildren = children.length && children.find((c) => !!c);
  if (!(editor.isInline(el) || editor.isVoid(el)) && !hasValidChildren) {
    children = [{ text: '' }];
  }

  // console.log('children', children);
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
  let children = el.childNodes;
  if (
    // handle formatting from OpenOffice
    children.length === 1 &&
    children[0].nodeType === 3 &&
    children[0].textContent === '\n'
  ) {
    return jsx('text', {}, ' ');
  }
  children = deserializeChildren(el, editor);

  // whitespace is replaced by deserialize() with null;
  children = children.map((c) => (c === null ? ' ' : c));

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

  const res = children.find((c) => typeof c !== 'string')
    ? children
    : jsx('text', {}, children);
  return res;
};

export const bTagDeserializer = (editor, el) => {
  // Google Docs does weird things with <b> tag
  return (el.getAttribute('id') || '').indexOf('docs-internal-guid') > -1
    ? deserializeChildren(el, editor)
    : jsx('element', { type: 'b' }, deserializeChildren(el, editor));
};

export const codeTagDeserializer = (editor, el) => {
  return jsx('element', { type: 'code' }, el.textContent);
};

export const preTagDeserializer = (editor, el) => {
  // Based on Slate example implementation. Replaces <pre> tags with <code>.
  // Comment: I don't know how good of an idea is this. I'd rather have two
  // separate formats: "preserve whitespace" and "code". This feels like a hack
  const { nodeName } = el;
  let parent = el;

  if (el.childNodes[0] && el.childNodes[0].nodeName === 'CODE') {
    parent = el.childNodes[0];
    return codeTagDeserializer(editor, parent);
  }

  return blockTagDeserializer(nodeName)(editor, parent);
};
