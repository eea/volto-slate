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

import './style.css';
import { createEmptyParagraph } from '../utils/blocks';
import makeEditor from 'volto-slate/editor/makeEditor';

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

  const editor = React.useMemo(() => {
    const editor = makeEditor();
    editor.isNotTextBlock = true;
    // make editor.getBlockProps available for extensions
    editor.getBlockProps = () => null;
    return editor;
  }, []);

  const token = useSelector((state) => state.userSession.token);

  const toHtml = React.useCallback(
    (value) => {
      const mockStore = configureStore();
      const html = ReactDOMServer.renderToStaticMarkup(
        <Provider store={mockStore({ userSession: { token } })}>
          <MemoryRouter>{serializeNodes(value || [])}</MemoryRouter>
        </Provider>,
      );

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
      const data = deserialize(editor, body);
      const res = data.length ? data : [createEmptyParagraph()];
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
