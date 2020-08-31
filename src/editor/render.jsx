import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Node, Text } from 'slate';
import cx from 'classnames';

import { settings } from '~/config';

// TODO: read, see if relevant
// https://reactjs.org/docs/higher-order-components.html#dont-use-hocs-inside-the-render-method
export const Element = ({ element, attributes, ...rest }) => {
  const { slate } = settings;
  const { elements } = slate;
  const El = elements[element.type] || elements['default'];

  const attrs = { ...attributes, className: element.styleName };
  return <El element={element} {...rest} attributes={{ ...attrs }} />;
};

export const Leaf = ({ children, ...rest }) => {
  const { attributes, leaf, mode } = rest;
  let { leafs } = settings.slate;

  children = Object.keys(leafs).reduce((acc, name) => {
    return Object.keys(leaf).includes(name)
      ? leafs[name]({ children: acc })
      : acc;
  }, children);

  const klass = cx({
    [`highlight-${leaf.highlightType}`]: mode !== 'view' && leaf.highlight,
    'highlight-selection': mode !== 'view' && leaf.isSelection,
  });

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
  const editor = { children: nodes || [] };

  const _serializeNodes = (nodes) => {
    return (nodes || []).map(([node, path], i) => {
      return Text.isText(node) ? (
        <Leaf
          editor={editor}
          path={path}
          leaf={node}
          text={node}
          mode="view"
          key={path}
        >
          {node.text}
        </Leaf>
      ) : (
        <Element
          editor={editor}
          path={path}
          element={node}
          mode="view"
          key={path}
        >
          {_serializeNodes(Array.from(Node.children(editor, path)))}
        </Element>
      );
    });
  };

  return _serializeNodes(Array.from(Node.children(editor, [])));
};

export const serializeNodesToText = (nodes) => {
  return nodes.map((n) => Node.string(n)).join('\n');
};

export const serializeNodesToHtml = (nodes) =>
  renderToStaticMarkup(serializeNodes(nodes));
