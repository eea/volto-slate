import React, { useMemo, useCallback } from 'react';
import { Node } from 'slate';

const Placeholder = props => {
  return (
    <span style={{ backgroundColor: 'red' }} {...props.attributes}>
      {props.children}
    </span>
  );
};

export const Element = ({ attributes, children, element }) => {
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
    case 'placeholder':
      return <Placeholder {...attributes}>{children}</Placeholder>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export const Leaf = ({ attributes, children, leaf }) => {
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

  if (leaf.placeholder) {
    children = <span style={{ backgroundColor: 'red' }}>{children}</span>;
  }

  return <span {...attributes}>{children}</span>;
};

export const serialize = nodes => {
  return nodes.map(n => Node.string(n)).join('\n');
};
