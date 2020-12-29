import React from 'react';
// import renderer from 'react-test-renderer';
import WysiwygWidget from './WysiwygWidget';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { render, screen } from '@testing-library/react';

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
        value={{ data: 'abc <strong>def</strong>' }}
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

  let v = { data: 'def <strong>abc</strong>' };
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
  await screen.findByText(/def/);

  // rerender();

  // debug();

  screen.debug();
  
  const f = asFragment();
  expect(f).toMatchSnapshot();
  // Simulate.keyPress(findByText('def'), { key: 'A' });
  // expect(asFragment()).toMatchSnapshot();
  // expect(onChangeMock).toHaveBeenCalledWith();
});
