/** @jsx jsx */
/* custom pragma, see
 * https://babeljs.io/docs/en/babel-plugin-transform-react-jsx#customizing-with-the-classic-runtime
 */

import { withReact } from 'slate-react';
import { withHandleBreak } from '.';
import { blockEntryAboveSelection } from './withHandleBreak';
import { createHyperscript } from 'slate-hyperscript';

export const jsx = createHyperscript({
  elements: {
    block: {},
    inline: { inline: true },
  },
});

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

  it('basic test', async () => {
    const input = (
      <editor>
        <block>
          abc
          <cursor />
          def
        </block>
      </editor>
    );

    const output = (
      <editor>
        <block>
          abc
          <cursor />
        </block>
      </editor>
    );

    const editor = withHandleBreak(
      0,
      () => {},
      () => {},
      () => {},
    )(withReact(input));
    editor.insertBreak();

    // TODO: debug, get into the source, to understand where is __source added and why
    output.children[0]['__source'] = editor.children[0]['__source'];

    expect(output.children).toEqual(editor.children);
  });

  it('blockEntryAboveSelection', async () => {
    const input = (
      <editor>
        <selection>
          <anchor path={[0]} offset={1} />
          <focus path={[0]} offset={3} />
        </selection>
        <element>
          abc
          <cursor /> ghi
        </element>
      </editor>
    );

    // const output = (
    //   <editor>
    //     <block>
    //       abc
    //       <cursor />
    //     </block>
    //   </editor>
    // );

    const nop = () => {};

    const editor = withHandleBreak(0, nop, nop, nop)(withReact(input));
    // editor.insertBreak();

    expect(blockEntryAboveSelection(editor)).not.toBeUndefined();

    // TODO: debug, get into the source, to understand where is __source added and why
    // output.children[0]['__source'] = editor.children[0]['__source'];

    // expect(output.children).toEqual(editor.children);
  });
});
