import React from 'react';
import { Node } from 'slate';
import { settings } from '~/config';

// TODO: read, see if relevant
// https://reactjs.org/docs/higher-order-components.html#dont-use-hocs-inside-the-render-method
export const Element = (props) => {
  const { element } = props; // attributes, children,
  const { elements } = settings.slate;
  const El = elements[element.type] || elements['default'];

  return <El {...props} />;
};

export const Leaf = ({ attributes, leaf, children }) => {
  let { leafs } = settings.slate;

  children = Object.keys(leafs).reduce((acc, name) => {
    return leaf[name] ? leafs[name]({ children: acc }) : acc;
  }, children);

  return <span {...attributes}>{children}</span>;
};

export const plaintext_serialize = (nodes) => {
  return nodes.map((n) => Node.string(n)).join('\n');
};
