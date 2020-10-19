import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Node, Text } from 'slate';
import cx from 'classnames';
import { isEmpty, isEqual, omit } from 'lodash';

import { settings } from '~/config';

const OMITTED = ['editor', 'path'];

// TODO: read, see if relevant
// https://reactjs.org/docs/higher-order-components.html#dont-use-hocs-inside-the-render-method
export const Element = ({ element, attributes = {}, extras, ...rest }) => {
  const { slate } = settings;
  const { elements } = slate;
  const El = elements[element.type] || elements['default'];

  const out = Object.assign(
    {},
    ...Object.keys(attributes || {}).map((k) =>
      !isEmpty(attributes[k]) ? { [k]: attributes[k] } : {},
    ),
  );
  return <El element={element} {...omit(rest, OMITTED)} attributes={out} />;
};

export const Leaf = ({ children, ...rest }) => {
  const { attributes, leaf, mode } = rest;
  let { leafs } = settings.slate;

  children = Object.keys(leafs).reduce((acc, name) => {
    return Object.keys(leaf).includes(name)
      ? leafs[name]({ children: acc })
      : acc;
  }, children);

  const obj = {
    [`highlight-${leaf.highlightType}`]: mode !== 'view' && leaf.highlight,
    'highlight-selection': mode !== 'view' && leaf.isSelection,
  };

  // stylemenu support
  for (const prop in leaf) {
    if (prop.startsWith('style-')) {
      obj[prop.substring(6)] = true;
    }
  }

  const klass = cx(obj);

  return mode === 'view' ? (
    typeof children === 'string' ? (
      children.split('\n').map((t, i) => {
        // Softbreak support. Should do a plugin?
        return (
          <React.Fragment key={`${i}`}>
            {children.indexOf('\n') > -1 &&
            children.split('\n').length - 1 > i ? (
              <>
                {klass ? <span className={klass}>{t}</span> : t}
                <br />
              </>
            ) : klass ? (
              <span className={klass}>{t}</span>
            ) : (
              t
            )}
          </React.Fragment>
        );
      })
    ) : (
      <span className={klass}>{children}</span>
    )
  ) : (
    <span {...attributes} className={klass}>
      {children}
    </span>
  );
};

const serializeData = (node) => {
  return JSON.stringify({ type: node.type, data: node.data });
};

export const serializeNodes = (nodes, getAttributes) => {
  const editor = { children: nodes || [] };

  const _serializeNodes = (nodes) => {
    return (nodes || []).map(([node, path], i) => {
      return Text.isText(node) ? (
        <Leaf path={path} leaf={node} text={node} mode="view" key={path}>
          {node.text}
        </Leaf>
      ) : (
        <Element
          path={path}
          element={node}
          mode="view"
          key={path}
          data-slate-data={node.data ? serializeData(node) : null}
          attributes={
            isEqual(path, [0])
              ? getAttributes
                ? getAttributes(node, path)
                : null
              : null
          }
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
