import React from 'react';

import escapeHtml from 'escape-html';
import { Node, Text } from 'slate';

const serialize = node => {
  if (Text.isText(node)) {
    console.log('is text node', node);
    if (node.bold) {
      return `<strong>${escapeHtml(node.text)}</strong>`;
    }
    return escapeHtml(node.text);
  }

  const children = node.children.map(n => serialize(n)).join('');

  console.log('node', node);
  switch (node.type) {
    case 'quote':
      return `<blockquote><p>${children}</p></blockquote>`;
    case 'paragraph':
      return `<p>${children}</p>`;
    case 'link':
      return `<a href="${escapeHtml(node.url)}">${children}</a>`;
    default:
      return children;
  }
};
const TextBlockView = ({ data }) => {
  const { value } = data;
  console.log('view data', data);
  return <div dangerouslySetInnerHTML={{ __html: value.map(serialize) }} />;
};
export default TextBlockView;
