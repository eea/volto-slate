import { v4 as uuid } from 'uuid';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import { Transforms, Editor, Node } from 'slate';
import { serializeNodesToText } from 'volto-slate/editor/render';
import { omit } from 'lodash';
import { settings } from '~/config';

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

export function createSlateBlock(value, { index, onChangeBlock, onAddBlock }) {
  return new Promise((resolve) => {
    onAddBlock('slate', index + 1).then((id) => {
      const options = {
        '@type': 'slate',
        value: JSON.parse(JSON.stringify(value)),
        plaintext: serializeNodesToText(value),
      };
      onChangeBlock(id, options).then(() => resolve(id));
    });
  });
}

export function syncCreateSlateBlock(value) {
  const id = uuid();
  const block = {
    '@type': 'slate',
    value: JSON.parse(JSON.stringify(value)),
    plaintext: serializeNodesToText(value),
  };
  return [id, block];
}

export function createImageBlock(url, index, { onChangeBlock, onAddBlock }) {
  const block = {
    '@type': 'image',
    url,
  };
  return new Promise((resolve) => {
    onAddBlock('slate', index + 1).then((id) => {
      onChangeBlock(id, block).then(resolve(id));
    });
  });
}

export function createSlateTableBlock(
  rows,
  index,
  { onChangeBlock, onAddBlock },
) {
  const block = {
    '@type': 'slateTable',
    rows,
  };
  return new Promise((resolve) => {
    onAddBlock('slateTable', index + 1).then((id) => {
      onChangeBlock(id, block).then(resolve(id));
    });
  });
}

export const createAndSelectNewBlockAfter = (editor, blockValue) => {
  const blockProps = editor.getBlockProps();
  const { onSelectBlock } = blockProps;
  createSlateBlock(blockValue, blockProps).then((id) => onSelectBlock(id));
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

  console.log('editor.children', editor.children);
  const blockProps = editor.getBlockProps();
  const { slate } = settings;
  const { voltoBlockEmiters } = slate;

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
    let blocks = [];

    for (const [, path] of Node.children(editor, [])) {
      const pathRef = Editor.pathRef(editor, path);

      // extra nodes are always extracted after the text node
      let extras = voltoBlockEmiters.map((emit) => emit(editor, path)).flat(1);
      const [childNode] = Editor.node(editor, pathRef.current);

      if (childNode && !Editor.isEmpty(editor, childNode))
        blocks.push(syncCreateSlateBlock([childNode]));

      blocks = [...blocks, ...extras];
    }

    const blockids = blocks.map((b) => b[0]);

    const layout = [
      ...formData[blocksLayoutFieldname].items.slice(0, index),
      ...blockids,
      ...formData[blocksLayoutFieldname].items.slice(index),
    ].filter((id) => id !== blockProps.block);

    // TODO: add the placeholder block, because we remove it (because we remove
    // the current block)

    const data = {
      ...contextData,
      formData: {
        ...formData,
        [blocksFieldname]: omit(
          {
            ...formData[blocksFieldname],
            ...fromEntries(blocks),
          },
          blockProps.block,
        ),
        [blocksLayoutFieldname]: {
          ...formData[blocksLayoutFieldname],
          items: layout,
        },
      },
      selected: blockids[blockids.length - 1],
    };

    setContextData(data).then(() => resolve(blockids));
  });
}

// import { v4 as uuid } from 'uuid';
// import { Transforms } from 'slate';
// import { IMAGE } from 'volto-slate/constants';
// import { jsx } from 'slate-hyperscript';
// import { getBaseUrl } from '@plone/volto/helpers';
// import { createSlateTableBlock } from 'volto-slate/utils';
// export const deserializeTableTag = (editor, el) => {
//   if (el.localName !== 'table') {
//     return null;
//   }
//
//   let rows = [];
//
//   el.querySelectorAll('tr').forEach((val, idx) => {
//     let row = { key: uuid(), cells: [] };
//     val.childNodes.forEach((val2, idx2) => {
//       let ds = deserialize(editor, val2);
//
//       function dsx(ds) {
//         return Array.isArray(ds)
//           ? ds.map((x) => {
//               if (typeof x === 'string') {
//                 return { type: 'p', children: [{ text: x }] };
//               }
//               return dsx(x);
//             })
//           : ds;
//       }
//       ds = dsx(ds);
//
//       if (val2.localName === 'th') {
//         row.cells.push({
//           key: uuid(),
//           type: 'header',
//           value: ds,
//         });
//       } else if (val2.localName === 'td') {
//         row.cells.push({
//           key: uuid(),
//           type: 'data',
//           value: ds,
//         });
//       }
//     });
//
//     rows.push(row);
//   });
//
//   console.log('TABLE', rows);
//
//   // TODO: get the correct index here
//
//   // const { onChangeBlock, onAddBlock } = editor.getBlockProps();
//   // createSlateTableBlock(rows, 0, { onChangeBlock, onAddBlock });
//
//   // const attrs = { type: IMAGE };
//
//   // for (const name of el.getAttributeNames()) {
//   //   attrs[name] = el.getAttribute(name);
//   // }
//
//   // return jsx('text', {}, '');
//   // return [jsx('element', attrs, [{ text: '' }]), jsx('text', {}, '')];
//   return null; // [jsx('element', attrs, [{ text: '' }])];
// };
