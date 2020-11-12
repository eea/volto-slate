import React from 'react';
import renderer from 'react-test-renderer';
import Cell from './Cell';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';

const mockStore = configureStore();

global.__SERVER__ = true; // eslint-disable-line no-underscore-dangle

test('renders a cell component', () => {
  const store = mockStore({
    intl: {
      locale: 'en',
      messages: {},
    },
  });
  const component = renderer.create(
    <Provider store={store}>
      <Cell onChange={() => {}} onSelectCell={() => {}} />,
    </Provider>,
  );
  const json = component.toJSON();
  expect(json).toMatchSnapshot();
});
