import React, { Fragment } from 'react';
import { Node } from 'slate';
import { settings } from '~/config';
import { LinkElement } from './plugins/Link';

export const Element = props => {
  const { attributes, children, element } = props;
  const AddonEl = settings.slate.elements[element.type];

  if (AddonEl) {
    console.log('<AddonEl {...attributes}>', AddonEl);
    console.log('props', props);
    return <AddonEl {...props} />;
  }

  console.log('element.type', element.type);

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
  const { leafs, availableLeafs } = settings.slate;

  children = leafs.reduce((acc, name) => {
    return leaf[name] ? availableLeafs[name]({ children: acc }) : acc;
  }, children);

  return <span {...attributes}>{children}</span>;
};

export const plaintext_serialize = nodes => {
  return nodes.map(n => Node.string(n)).join('\n');
};
