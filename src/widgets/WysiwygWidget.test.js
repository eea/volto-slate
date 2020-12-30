import React from 'react';
// import renderer from 'react-test-renderer';
import WysiwygWidget from './WysiwygWidget';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
// import { Simulate } from 'react-dom/test-utils';
import { fireEvent, render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';

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
            <p {...attributes}>{children}</p>
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

window.getSelection = () => ({});

test('renders a WysiwygWidget component', () => {
  // TODO: make this test capture in the snapshot the ~second render which loads
  // the data given through props (currently it displays a Slate Editable in the
  // snapshot which has the default contents defined above in the jest.mock
  // call).
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
        onChange={(id, data) => {
          // console.log('changed', data.data);
          // setHtml(data.data);
        }}
      />
    </Provider>,
  );
  const f = asFragment();
  expect(f).toMatchSnapshot();
});

test('renders a WysiwygWidget component with working onChange prop', async () => {
  const onChangeMock = jest.fn();

  // TODO: make this test capture in the snapshot the ~second render which loads
  // the data given through props (currently it displays a Slate Editable in the
  // snapshot which has the default contents defined above in the jest.mock
  // call).
  const store = mockStore({
    intl: {
      locale: 'en',
      messages: {},
    },
  });

  let v = { data: 'second <strong>render</strong>' };
  const { asFragment, rerender, getByText, findByText, debug } = render(
    <Provider store={store}>
      <WysiwygWidget
        id="qwertyu"
        title="My Widget"
        description="My little description."
        required={true}
        value={v}
        onChange={
          // (id, data) => {
          //   v = { data: data };
          //   rerender();
          // }
          onChangeMock /*(id, data) => {
          // console.log('changed', data.data);
          // setHtml(data.data);
          // }*/
        }
      />
    </Provider>,
    { hydrate: true },
  );

  // screen.debug();

  // rerender();

  // await new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     resolve();
  //   }, 1000);
  // });

  // rerender();

  // v = { data: 'def' };
  // rerender();

  // rerender();

  // debug();
  // screen.debug();

  const f = asFragment();
  expect(f).toMatchSnapshot();

  const thing = await screen.findByText(/render/);

  // fireEvent.keyDown(thing, { key: 'A', code: 'KeyA' });
  fireEvent.blur(thing, {
    target: { innerHTML: 'renderA' },
  });

  // userEvent.type(thing, '{selectall}renderA');
  // Simulate.focus(thing);
  // Simulate.keyPress(thing, { key: 'A' });
  // fireEvent.focusIn(thing);
  // fireEvent.keyPress(thing, { key: 'A', code: 'KeyA' });
  // fireEvent.input(thing, { target: { value: 'renderA' } });
  // fireEvent.change(thing, { target: { value: 'renderA' } });

  await screen.findByText(/A/);

  const f2 = asFragment();
  expect(f2).toMatchSnapshot();

  expect(onChangeMock).toHaveBeenCalledTimes(1);
});
