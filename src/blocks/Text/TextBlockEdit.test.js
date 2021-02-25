import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { render } from '@testing-library/react';
import config from '@plone/volto/registry';
import TextBlockEdit from './TextBlockEdit';

const mockStore = configureStore();

// ReactDOM.createPortal = (node) => node;

window.getSelection = () => null;

global.__SERVER__ = true; // eslint-disable-line no-underscore-dangle
global.__CLIENT__ = false; // eslint-disable-line no-underscore-dangle

beforeAll(() => {
  config.widgets = {
    id: {
      default: () => <div />,
    },
    type: {
      boolean: () => <div />,
    },
  };

  config.settings = {
    supportedLanguages: [],
    slate: {
      elements: {
        default: ({ attributes, children }) => (
          <p {...attributes}>{children}</p>
        ),
      },
      leafs: {},
      persistentHelpers: [],
      contextToolbarButtons: [],
      textblockExtensions: [],
      extensions: [],
    },
  };
});

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
                type: 'p',
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
