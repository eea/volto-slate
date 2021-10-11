import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';

import Edit from './TitleBlockEdit';

const mockStore = configureStore();

// TODO: make the tests in this file really put the Slate editors in the
// snapshots (currently we face this issue:
// https://github.com/ianstormtaylor/slate/issues/4589)

global.__SERVER__ = true; // eslint-disable-line no-underscore-dangle

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
        onAddBlock={() => { }}
        onChangeField={() => { }}
        onSelectBlock={() => { }}
        onDeleteBlock={() => { }}
        onFocusPreviousBlock={() => { }}
        onFocusNextBlock={() => { }}
        handleKeyDown={() => { }}
        index={1}
        blockNode={{ current: null }}
        className="documentFirstHeading"
        formFieldName="title"
        data={{ disableNewBlocks: false }}
      />
    </Provider>,
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
        onAddBlock={() => { }}
        onChangeField={() => { }}
        onSelectBlock={() => { }}
        onDeleteBlock={() => { }}
        onFocusPreviousBlock={() => { }}
        onFocusNextBlock={() => { }}
        handleKeyDown={() => { }}
        index={1}
        blockNode={{ current: null }}
        className="documentDescription"
        formFieldName="description"
        data={{ disableNewBlocks: false }}
      />
    </Provider>,
  );
  const json = component.toJSON();
  expect(json).toMatchSnapshot();
});
