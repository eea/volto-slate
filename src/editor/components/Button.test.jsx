import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { wait, render } from '@testing-library/react';

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
    const { asFragment } = render(
      <Provider store={store}>
        <Button />
      </Provider>,
    );
    await wait(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
