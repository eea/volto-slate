import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { JSDOM } from 'jsdom';

import Edit from './TitleBlockEdit';

const mockStore = configureStore();

describe('renders edit blocks', () => {
  beforeEach(() => {
    const jsdom = new JSDOM();
    global.window = jsdom.window;
    global.document = jsdom.window.document;
    global.Document = document.constructor;
  });

  test('renders an edit title block component', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
    });
    const component = renderer.create(
      <Provider store={store}>
        <Edit
          properties={{ title: 'My Title' }}
          selected={false}
          block="1234"
          onAddBlock={() => {}}
          onChangeField={() => {}}
          onSelectBlock={() => {}}
          onDeleteBlock={() => {}}
          onFocusPreviousBlock={() => {}}
          onFocusNextBlock={() => {}}
          handleKeyDown={() => {}}
          index={1}
          blockNode={{ current: null }}
          className="documentFirstHeading"
          formFieldName="title"
          data={{ disableNewBlocks: false }}
        />
      </Provider>,
      {
        createNodeMock: () => ({
          ownerDocument: global.document,
          getRootNode: () => global.document,
        }),
      },
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  test('renders an edit description block component', () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
    });
    const component = renderer.create(
      <Provider store={store}>
        <Edit
          properties={{ description: 'My Description' }}
          selected={false}
          block="1234"
          onAddBlock={() => {}}
          onChangeField={() => {}}
          onSelectBlock={() => {}}
          onDeleteBlock={() => {}}
          onFocusPreviousBlock={() => {}}
          onFocusNextBlock={() => {}}
          handleKeyDown={() => {}}
          index={1}
          blockNode={{ current: null }}
          className="documentDescription"
          formFieldName="description"
          data={{ disableNewBlocks: false }}
        />
      </Provider>,
      {
        createNodeMock: () => ({
          ownerDocument: global.document,
          getRootNode: () => global.document,
        }),
      },
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
