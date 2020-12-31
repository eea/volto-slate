import React from 'react';
import WysiwygWidget from './WysiwygWidget';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { fireEvent, render, screen } from '@testing-library/react';

const mockStore = configureStore();

global.__SERVER__ = true; // eslint-disable-line no-underscore-dangle
global.__CLIENT__ = false; // eslint-disable-line no-underscore-dangle

jest.mock('~/config', () => {
  const createEmptyParagraph = () => {
    return {
      type: 'p',
      children: [{ text: '' }],
    };
  };
  return {
    settings: {
      supportedLanguages: [],
      slate: {
        elements: {
          default: ({ attributes, children }) => (
            <span {...attributes}>{children}</span>
          ),
          strong: ({ attributes, children }) => (
            <strong {...attributes}>{children}</strong>
          ),
        },
        leafs: {},
        defaultBlockType: 'p',
        textblockExtensions: [],
        extensions: [],
        defaultValue: () => {
          return [createEmptyParagraph()];
        },
        persistentHelpers: [],
        contextToolbarButtons: [],
      },
    },
  };
});

window.getSelection = jest.fn();

test('renders a WysiwygWidget component', () => {
  const store = mockStore({
    intl: {
      locale: 'en',
      messages: {},
    },
  });
  const { asFragment } = render(
    <Provider store={store}>
      <WysiwygWidget
        id="qwertyu"
        title="My Widget"
        description="My little description."
        required={true}
        value={{ data: 'first <strong>render</strong>' }}
        onChange={() => {}}
      />
    </Provider>,
  );
  const f = asFragment();
  expect(f).toMatchSnapshot();
});

test('renders a WysiwygWidget component with working onChange prop', async () => {
  const onChangeMock = jest.fn();

  const store = mockStore({
    intl: {
      locale: 'en',
      messages: {},
    },
  });

  let v = { data: 'second <strong>render</strong>' };
  const { asFragment } = render(
    <Provider store={store}>
      <WysiwygWidget
        id="qwertyu"
        title="My Widget"
        description="My little description."
        required={true}
        value={v}
        onChange={onChangeMock}
      />
    </Provider>,
  );

  const f = asFragment();
  expect(f).toMatchSnapshot();

  const thing = await screen.findByText(/render/);

  fireEvent.blur(thing, {
    target: { innerHTML: 'renderA' },
  });

  await screen.findByText(/A/);

  const f2 = asFragment();
  expect(f2).toMatchSnapshot();

  // TODO: repair: this always fails:
  expect(onChangeMock).toHaveBeenCalledTimes(1);
});
