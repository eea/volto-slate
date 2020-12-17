import React from 'react';
import renderer from 'react-test-renderer';
import WysiwygWidget from './WysiwygWidget';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';

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
  const component = renderer.create(
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
  const json = component.toJSON();
  expect(json).toMatchSnapshot();
});
