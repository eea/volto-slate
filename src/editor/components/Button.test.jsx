import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { wait } from '@testing-library/react';

import Button from './Button';

const mockStore = configureStore();

describe('Button', () => {
  it('renders a button', async () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
    });
    const component = renderer.create(
      <Provider store={store}>
        <Button pathname="/test" />
      </Provider>,
    );
    await wait(() => {
      expect(component.toJSON()).toMatchSnapshot();
    });
  });
});
