import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { render } from '@testing-library/react';

import TextBlockEdit from './TextBlockEdit';

// TODO: use this instead of expecting some props to be undefined
import { settings } from '~/config';

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

    // TODO: also test for the initial contents: My first paragraph.
    const { asFragment } = render(
      <Provider store={store}>
        <TextBlockEdit
          block="478923"
          blockNode={{ current: {} }}
          detached={false}
          index={2}
          onAddBlock={() => {}}
          onChangeBlock={() => {}}
          onDeleteBlock={() => {}}
          onFocusNextBlock={() => {}}
          onFocusPreviousBlock={() => {}}
          onMutateBlock={() => {}}
          onSelectBlock={() => {}}
          properties={{}}
          setSlateBlockSelection={() => {}}
          data={{
            value: [
              {
                type: 'paragraph',
                children: [{ text: '' /* My first paragraph. */ }],
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
