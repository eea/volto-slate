import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Node, Text } from 'slate';
import cx from 'classnames';

import { settings } from '~/config';

// TODO: read, see if relevant
// https://reactjs.org/docs/higher-order-components.html#dont-use-hocs-inside-the-render-method
export const Element = ({ element, ...rest }) => {
  const { slate } = settings;
  const { elements } = slate;
  const El = elements[element.type] || elements['default'];

  return <El element={element} {...rest} />;
};

export const Leaf = ({ attributes, leaf, children, mode, text, ...rest }) => {
  let { leafs } = settings.slate;
  console.log('rest', rest);

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
  let index = 0;
  const editor = { children: nodes };

  const _serializeNodes = (nodes) => {
    return (nodes || []).map(([node, path], i) => {
      const id = index++;

      return Text.isText(node) ? (
        <Leaf
          editor={editor}
          path={path}
          leaf={node}
          text={node}
          attributes={{ 'data-slate-leaf': true }}
          mode="view"
          key={id}
        >
          {node.text}
        </Leaf>
      ) : (
        <Element
          element={node}
          attributes={{ 'data-slate-node': 'element', ref: null }}
          mode="view"
          key={id}
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
