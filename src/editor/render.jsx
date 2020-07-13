import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Node, Text } from 'slate';

import { settings } from '~/config';

// TODO: read, see if relevant
// https://reactjs.org/docs/higher-order-components.html#dont-use-hocs-inside-the-render-method
export const Element = (props) => {
  const { element } = props; // attributes, children,
  const { elements } = settings.slate;
  const El = elements[element.type] || elements['default'];

  return <El {...props} />;
};

export const Leaf = ({ attributes, leaf, children, mode }) => {
  let { leafs } = settings.slate;

  children = Object.keys(leafs).reduce((acc, name) => {
    return leaf[name] ? leafs[name]({ children: acc }) : acc;
  }, children);

  const klass =
    mode !== 'view' && leaf.highlight
      ? `highlight-${leaf.highlightType}`
      : null;

  return mode === 'view' ? (
    typeof children === 'string' ? (
      children.split('\n').map((t, i) => {
        return (
          <>
            {children.indexOf('\n') > -1 &&
            children.split('\n').length - 1 > i ? (
              <>
                {t}
                <br />
              </>
            ) : (
              t
            )}
          </>
        );
      })
    ) : (
      children
    )
  ) : (
    <span {...attributes} className={klass}>
      {children}
    </span>
  );
};

export const serializeNodes = (nodes) =>
  (nodes || []).map((node, i) => {
    if (Text.isText(node)) {
      return (
        <Leaf
          leaf={node}
          text={node}
          attributes={{ 'data-slate-leaf': true }}
          mode="view"
          key={node.id || i}
        >
          {node.text}
        </Leaf>
      );
    }
    return (
      <Element
        element={node}
        attributes={{ 'data-slate-node': 'element', ref: null }}
        mode="view"
        key={i}
      >
        {serializeNodes(node.children)}
      </Element>
    );
  });

export const serializeNodesToText = (nodes) => {
  return nodes.map((n) => Node.string(n)).join('\n');
};

export const serializeNodesToHtml = (nodes) =>
  renderToStaticMarkup(serializeNodes(nodes));
