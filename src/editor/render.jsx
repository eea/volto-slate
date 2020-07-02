import React from 'react';
import { Node } from 'slate';
import { settings } from '~/config';

// TODO: read, see if relevant
// https://reactjs.org/docs/higher-order-components.html#dont-use-hocs-inside-the-render-method
export const Element = (props) => {
  const { element } = props; // attributes, children,
  const { elementRenderers } = settings.slate;
  const El = elementRenderers[element.type] || elementRenderers['default'];

  return <El {...props} />;
};

export const Leaf = ({ attributes, leaf, children }) => {
  let { leafTypes = [], leafRenderers = {} } = settings || {};

  children = leafTypes.reduce((acc, name) => {
    return leaf[name] ? leafRenderers[name]({ children: acc }) : acc;
  }, children);

  return <span {...attributes}>{children}</span>;
};

export const plaintext_serialize = (nodes) => {
  return nodes.map((n) => Node.string(n)).join('\n');
};
