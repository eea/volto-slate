/** @jsx jsx */

import { jsx } from '../../__test-utils__/jsx';

import { withReact } from 'slate-react';
import { withHandleBreak } from '.';

describe('withHandleBreak decorator', () => {
  it('example test', async () => {
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

    // console.log('etc', [output]);

    const editor = withHandleBreak(
      0,
      () => {},
      () => {},
      () => {},
    )(withReact(input));
    editor.insertText(text);

    // TODO: debug, get into the source, to understand where is __source added and why
    output.children[0]['__source'] = editor.children[0]['__source'];

    expect(output.children).toEqual(editor.children);
  });
});
