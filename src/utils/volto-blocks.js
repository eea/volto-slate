import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import { Transforms, Editor } from 'slate';
import { serializeNodesToText } from 'volto-slate/editor/render';

// TODO: should be made generic, no need for "prevBlock.value"
export function mergeSlateWithBlockBackward(editor, prevBlock, event) {
  // To work around current architecture limitations, read the value from
  // previous block. Replace it in the current editor (over which we have
  // control), join with current block value, then use this result for previous
  // block, delete current block
  //

  const prev = prevBlock.value;

  // collapse the selection to its start point
  Transforms.collapse(editor, { edge: 'start' });

  // insert the contents of the previous editor into the current editor
  Transforms.insertNodes(editor, prev, {
    at: Editor.start(editor, []),
  });

  Editor.deleteBackward(editor, { unit: 'character' });
}

export function mergeSlateWithBlockForward(editor, nextBlock, event) {
  // To work around current architecture limitations, read the value from next
  // block. Replace it in the current editor (over which we have control), join
  // with current block value, then use this result for next block, delete
  // current block

  const next = nextBlock.value;

  // collapse the selection to its start point
  Transforms.collapse(editor, { edge: 'end' });
  Transforms.insertNodes(editor, next, {
    at: Editor.end(editor, []),
  });

  Editor.deleteForward(editor, { unit: 'character' });
}

export function createSlateBlock(value, index, { onChangeBlock, onAddBlock }) {
  const id = onAddBlock('slate', index + 1);

  const options = {
    '@type': 'slate',
    value: JSON.parse(JSON.stringify(value)),
    plaintext: serializeNodesToText(value),
  };
  onChangeBlock(id, options);
  return id;
}

export function createImageBlock(url, index, { onChangeBlock, onAddBlock }) {
  const id = onAddBlock('slate', index + 1);

  const options = {
    '@type': 'image',
    url,
  };
  onChangeBlock(id, options);
  return id;
}

export function createAndSelectNewSlateBlock(value, index, props) {
  setTimeout(() => {
    const id = createSlateBlock(value, index, props);
    const { onSelectBlock } = props;

    setTimeout(() => onSelectBlock(id), 0);
  }, 0);
}

export const createAndSelectNewBlockAfter = (editor, blockValue) => {
  const blockProps = editor.getBlockProps();
  const { index, onChangeBlock, onSelectBlock, onAddBlock } = blockProps;
  return createAndSelectNewSlateBlock(blockValue, index, {
    onChangeBlock,
    onAddBlock,
    onSelectBlock,
  });
};

export function getNextVoltoBlock(index, properties) {
  // TODO: look for any next slate block
  // join this block with previous block, if previous block is slate
  const blocksFieldname = getBlocksFieldname(properties);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);

  const blocks_layout = properties[blocksLayoutFieldname];

  if (index === blocks_layout.items.length) return;

  const nextBlockId = blocks_layout.items[index + 1];
  const nextBlock = properties[blocksFieldname][nextBlockId];

  return [nextBlock, nextBlockId];
}

export function getPreviousVoltoBlock(index, properties) {
  // TODO: look for any prev slate block
  if (index === 0) return;

  const blocksFieldname = getBlocksFieldname(properties);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);

  const blocks_layout = properties[blocksLayoutFieldname];
  const prevBlockId = blocks_layout.items[index - 1];
  const prevBlock = properties[blocksFieldname][prevBlockId];

  return [prevBlock, prevBlockId];
}

export function deconstructToVoltoBlocks(editor) {
  // Explodes editor content into separate blocks
  const blockProps = editor.getBlockProps();
  const { index } = blockProps;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // setTimeout() hack needed to overcome Volto API limitations in Form.jsx
      const total = editor.children.length;
      console.log('deconstruct', total, JSON.stringify(editor.children));
      const [first, ...rest] = editor.children;

      // extract all image elements separately, create Volto blocks from them
      const images = Array.from(
        Editor.nodes(editor, {
          at: [],
          match: (node) => node.type === 'img', // hardcoded
        }),
      );
      console.log('images', images);

      images.forEach(([el, path]) => {
        if (path[0] === 0) {
          Transforms.removeNodes(editor, { at: path });
          const newid = createImageBlock(el.src, index, blockProps);
          resolve(newid);
        }
      });

      if (!rest.length) return;

      // removes all children from the editor
      for (let i = 0; i <= editor.children.length + 1; i++) {
        Transforms.removeNodes(editor, { at: [0] });
      }
      // insert back the first child
      Transforms.insertNodes(editor, first);

      setTimeout(() => {
        rest.reverse().forEach((block, i) => {
          // due to reverse() above. Advantage is that we don't
          // have to keep track of index. Might be error-prone
          const imgIndex = total - i;
          images.forEach(([el, path]) => {
            if (path[0] === imgIndex) {
              Transforms.removeNodes(editor, { at: path });
              const newid = createImageBlock(el.src, index, blockProps);
              resolve(newid);
            }
          });
          const newid = createSlateBlock([block], index, blockProps);
          resolve(newid);
        });
      }, 0);
    }, 0);
  });
}
