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
        // Softbreak support. Should do a plugin
        return (
          <React.Fragment key={`${i}`}>
            {children.indexOf('\n') > -1 &&
            children.split('\n').length - 1 > i ? (
              <>
                {t}
                <br />
              </>
            ) : (
              t
            )}
          </React.Fragment>
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

export const serializeNodes = (nodes) => {
  let index = 0;

  const _serializeNodes = (nodes) =>
    (nodes || []).map((node, i) => {
      const id = index++;

      if (Text.isText(node)) {
        return (
          <Leaf
            leaf={node}
            text={node}
            attributes={{ 'data-slate-leaf': true }}
            mode="view"
            key={id}
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
          key={id}
        >
          {_serializeNodes(node.children)}
        </Element>
      );
    });

  return _serializeNodes(nodes);
};

export const serializeNodesToText = (nodes) => {
  return nodes.map((n) => Node.string(n)).join('\n');
};

export const serializeNodesToHtml = (nodes) =>
  renderToStaticMarkup(serializeNodes(nodes));
