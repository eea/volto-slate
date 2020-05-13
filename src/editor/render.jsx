import React from 'react';
import { Node } from 'slate';
import { settings } from '~/config';

export const Element = props => {
  const { attributes, children, element } = props;
  const addonEl = settings.slate.elements[element.type];

  if (addonEl) return addonEl(props);

  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export const Leaf = ({ attributes, leaf, children }) => {
  const leafTypes = settings.slate.leafs;

  children = Object.keys(leafTypes || {}).reduce((acc, name) => {
    return leaf[name] ? leafTypes[name]({ children: acc }) : children;
  }, children);

  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

export const plaintext_serialize = nodes => {
  return nodes.map(n => Node.string(n)).join('\n');
};
