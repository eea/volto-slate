import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { wait, render } from '@testing-library/react';
import ReactDOM from 'react-dom';

import { Editor } from 'slate';
import TextBlockEdit from './TextBlockEdit';

const mockStore = configureStore();

// ReactDOM.createPortal = (node) => node;

window.getSelection = () => null;

describe('TextBlockEdit', () => {
  it('renders w/o errors', async () => {
    const store = mockStore({
      intl: {
        locale: 'en',
        messages: {},
      },
    });

    const { asFragment } = render(
      <Provider store={store}>
        <TextBlockEdit
          data={{
            value: [
              {
                type: 'paragraph',
                children: [{ text: 'My first paragraph.' }],
              },
            ],
          }}
          selected={true}
        />
      </Provider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
