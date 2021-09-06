/**
 * HtmlSlateWidget, a slate widget variant that saves its data as HTML
 */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';

import { FormFieldWrapper } from '@plone/volto/components';
import SlateEditor from 'volto-slate/editor/SlateEditor';
import { serializeNodes } from 'volto-slate/editor/render';
import deserialize from 'volto-slate/editor/deserialize';
import { Provider, useSelector } from 'react-redux';
import { createDefaultBlock } from 'volto-slate/utils';
import { Text } from 'slate';
// import { Editor } from 'slate';

import './style.css';
import { createEmptyParagraph } from '../utils/blocks';
import makeEditor from 'volto-slate/editor/makeEditor';

const normalizeToSlate = (editor, nodes) => {
  // Normalizes a slate value (a list of nodes) to slate constraints
  //
  // Slate built-in constraint:
  // - Inline nodes cannot be the first or last child of a parent block, nor
  // can it be next to another inline node in the children array. If this is
  // the case, an empty text node will be added to correct this to be in
  // compliance with the constraint.

  nodes.forEach((node) => {
    const { children = [] } = node;

    if (children.length) {
      node.children = normalizeToSlate(
        editor,
        children.reduce((acc, node, index) => {
          return index === 0 && editor.isInline(node)
            ? [{ text: '' }, node]
            : index === children.length - 1
            ? [...acc, node, { text: '' }]
            : [...acc, node, { text: '' }];
        }, []),
      );
    }
  });
  return nodes;
};

export function normalizeBlockNodes(editor, children) {
  // Basic normalization of slate content.
  // Make sure that no inline element is alone, without a block element parent.

  const isInline = (n) =>
    typeof n === 'string' || Text.isText(n) || editor.isInline(n);

  let nodes = [];
  let currentBlockNode = null;

  children.forEach((node) => {
    if (isInline(node)) {
      node = typeof node === 'string' ? { text: node } : node;
      if (!currentBlockNode) {
        currentBlockNode = createDefaultBlock([node]);
        nodes.push(currentBlockNode);
      } else {
        currentBlockNode.children.push(node);
      }
    } else {
      currentBlockNode = null;
      nodes.push(node);
    }
  });

  nodes = normalizeToSlate(editor, nodes);
  return nodes;
}

const HtmlSlateWidget = (props) => {
  const {
    id,
    onChange,
    value,
    focus,
    className,
    block,
    placeholder,
    properties,
  } = props;

  const [selected, setSelected] = React.useState(focus);

  const editor = React.useMemo(() => makeEditor(), []);

  const token = useSelector((state) => state.userSession.token);

  const toHtml = React.useCallback(
    (value) => {
      const mockStore = configureStore();
      const html = ReactDOMServer.renderToStaticMarkup(
        <Provider store={mockStore({ userSession: { token } })}>
          <MemoryRouter>{serializeNodes(value || [])}</MemoryRouter>
        </Provider>,
      );
      // console.log('toHtml value', JSON.stringify(value));
      // console.log('toHtml html', html);

      return {
        'content-type': value ? value['content-type'] : 'text/html',
        encoding: value ? value.encoding : 'utf8',
        data: html,
      };
    },
    [token],
  );

  const fromHtml = React.useCallback(
    (value) => {
      const html = value?.data || '';

      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const body =
        parsed.getElementsByTagName('google-sheets-html-origin').length > 0
          ? parsed.querySelector('google-sheets-html-origin > table')
          : parsed.body;
      let data = deserialize(editor, body);
      data = normalizeBlockNodes(editor, data);

      // editor.children = data;
      // Editor.normalize(editor);
      // TODO: need to add {text: ""} placeholders between elements
      const res = data.length ? data : [createEmptyParagraph()];
      // console.log('from html', { html: value?.data, res });
      return res;
    },
    [editor],
  );

  return (
    <FormFieldWrapper {...props} draggable={false} className="slate_wysiwyg">
      <div
        className="slate_wysiwyg_box"
        role="textbox"
        tabIndex="-1"
        style={{ boxSizing: 'initial' }}
        onClick={() => {
          setSelected(true);
        }}
        onKeyDown={() => {}}
      >
        <SlateEditor
          className={className}
          id={id}
          name={id}
          value={fromHtml(value)}
          onChange={(newValue) => {
            onChange(id, toHtml(newValue));
          }}
          block={block}
          renderExtensions={[]}
          selected={selected}
          properties={properties}
          placeholder={placeholder}
        />
      </div>
    </FormFieldWrapper>
  );
};

export default HtmlSlateWidget;
