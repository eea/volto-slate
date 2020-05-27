/** @jsx jsx */

import { jsx } from '../__test-utils__/jsx';

import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { wait } from '@testing-library/react';
import ReactDOM from 'react-dom';

import { Editor } from 'slate';
import { withReact } from 'slate-react';
// import TextBlockEdit from './TextBlockEdit';
import { withHandleBreak } from './decorators';

// const mockStore = configureStore();

// ReactDOM.createPortal = (node) => node;

// window.getSelection = () => null;

describe('TextBlockEdit', () => {
  // it('renders w/o errors', async () => {
  //   const store = mockStore({
  //     intl: {
  //       locale: 'en',
  //       messages: {},
  //     },
  //   });

  //   let root;

  //   renderer.act(() => {
  //     root = renderer.create(
  //       <Provider store={store}>
  //         <TextBlockEdit
  //           data={{ value: [{ type: 'paragraph', children: [{ text: '' }] }] }}
  //           selected={true}
  //         />
  //       </Provider>,
  //     );
  //   });
  //   await wait(() => {
  //     expect(root.toJSON()).toMatchSnapshot();
  //   });
  // });

  it('withHandleBreak decorator', async () => {
    // const editor = withHandleBreak(
    //   5,
    //   () => {},
    //   () => {},
    //   () => {},
    // )(withReact(input));

    const input = (
      <editor>
        <block>
          test
          <cursor />
        </block>
      </editor>
    );

    const text = 'http://localhost:3000';

    const output = (
      <editor>
        <block>testhttp://localhost:3000</block>
      </editor>
    );

    console.log('etc', [output]);

    const editor = withReact(input);
    editor.insertText(text);

    // TODO: debug, get into the source, to understand where is __source added and why
    output.children[0]['__source'] = editor.children[0]['__source'];

    expect(output.children).toEqual(editor.children);
  });
});
