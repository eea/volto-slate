import { v4 as uuid } from 'uuid';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import { Transforms, Editor } from 'slate';
import { serializeNodesToText } from 'volto-slate/editor/render';

function fromEntries(pairs) {
  const res = {};
  pairs.forEach((p) => {
    res[p[0]] = p[1];
  });
  return res;
}

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
  // If the editor has multiple top-level children, split the current block
  // into multiple slate blocks. This will delete and replace the current
  // block.
  //
  // It returns a promise that, when resolved, will pass a list of Volto block
  // ids that were affected
  //
  // For the Volto blocks manipulation we do low-level changes to the context
  // form state, as that ensures a better performance (no un-needed UI updates)

  const blockProps = editor.getBlockProps();

  return new Promise((resolve, reject) => {
    if (editor.children.length === 1) {
      return resolve([blockProps.block]);
    }

    const { formContext } = editor;
    const { contextData, setContextData } = formContext;
    const { formData } = contextData;
    const blocksFieldname = getBlocksFieldname(formData);
    const blocksLayoutFieldname = getBlocksLayoutFieldname(formData);

    const { index } = blockProps;
    const blocks = [];

    console.log('deconstruct', editor.children);
    editor.children.forEach((child, i) => {
      const id = uuid();

      const block = {
        '@type': 'slate',
        value: JSON.parse(JSON.stringify([child])),
        plaintext: serializeNodesToText([child]),
      };
      blocks.push([id, block]);
    });

    const blockids = blocks.map((b) => b[0]);

    const layout = [
      ...formData[blocksLayoutFieldname].items.slice(0, index),
      ...blockids,
      ...formData[blocksLayoutFieldname].items.slice(index),
    ];

    const data = {
      ...contextData,
      formData: {
        ...formData,
        [blocksFieldname]: {
          ...formData[blocksFieldname],
          ...fromEntries(blocks),
        },
        [blocksLayoutFieldname]: {
          ...formData[blocksLayoutFieldname],
          items: layout,
        },
      },
    };
    console.log('data', data);

    setContextData(data).then(() => resolve(blockids));

    // For each root child of the editor, identify its images and then remove
    // them. They will be created as Volto blocks.

    //   // setTimeout() hack needed to overcome Volto API limitations in Form.jsx
    //   const total = editor.children.length;
    //   // console.log('deconstruct', total, JSON.stringify(editor.children));
    //   const [first, ...rest] = editor.children;
    //
    //   // extract all image elements separately, create Volto blocks from them
    //   // TODO: this is a temporary hack. We should reimplement when we have:
    //   // - block transformer based "image upload"
    //   const images = Array.from(
    //     Editor.nodes(editor, {
    //       at: [],
    //       match: (node) => node.type === 'img', // hardcoded
    //     }),
    //   );
    //   // console.log('images', images);
    //
    //   images.forEach(([el, path]) => {
    //     if (path[0] === 0) {
    //       Transforms.removeNodes(editor, { at: path });
    //       const newid = createImageBlock(el.src, index, blockProps);
    //       resolve(newid);
    //     }
    //   });
    //
    //   if (!rest.length) return;
    //
    //   // removes all children from the editor
    //   for (let i = 0; i <= editor.children.length + 1; i++) {
    //     Transforms.removeNodes(editor, { at: [0] });
    //   }
    //   // insert back the first child
    //   Transforms.insertNodes(editor, first);
    //
    //   setTimeout(() => {
    //     rest.reverse().forEach((block, i) => {
    //       // due to reverse() above. Advantage is that we don't
    //       // have to keep track of index. Might be error-prone
    //       const imgIndex = total - i;
    //       images.forEach(([el, path]) => {
    //         if (path[0] === imgIndex) {
    //           // TODO: fix this
    //           // Transforms.removeNodes(editor, { at: path });
    //           const newid = createImageBlock(el.src, index, blockProps);
    //           resolve(newid);
    //         }
    //       });
    //       const newid = createSlateBlock([block], index, blockProps);
    //       resolve(newid);
    //     });
    //   }, 0);
    // }, 0);
  });
}
