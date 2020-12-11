import ReactDOM from 'react-dom';
import { v4 as uuid } from 'uuid';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import { addBlock, changeBlock } from 'volto-slate/futurevolto/Blocks';
import { Transforms, Editor, Node } from 'slate';
import { serializeNodesToText } from 'volto-slate/editor/render';
import { omit, fromPairs, cloneDeep } from 'lodash';
import { settings } from '~/config';

// TODO: should be made generic, no need for "prevBlock.value"
export function mergeSlateWithBlockBackward(editor, prevBlock, event) {
  // To work around current architecture limitations, read the value from
  // previous block. Replace it in the current editor (over which we have
  // control), join with current block value, then use this result for previous
  // block, delete current block

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

export function syncCreateSlateBlock(value) {
  const id = uuid();
  const block = {
    '@type': 'slate',
    value: cloneDeep(value),
    plaintext: serializeNodesToText(value),
  };
  return [id, block];
}

export function createImageBlock(url, index, props) {
  const { properties, onChangeField, onSelectBlock } = props;
  const blocksFieldname = getBlocksFieldname(properties);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);

  const [id, formData] = addBlock(properties, 'image', index + 1);
  const newFormData = changeBlock(formData, id, { '@type': 'image', url });

  ReactDOM.unstable_batchedUpdates(() => {
    onChangeField(blocksFieldname, newFormData[blocksFieldname]);
    onChangeField(blocksLayoutFieldname, newFormData[blocksLayoutFieldname]);
    onSelectBlock(id);
  });
}

export const createAndSelectNewBlockAfter = (editor, blockValue) => {
  const blockProps = editor.getBlockProps();

  const { onSelectBlock, properties, index, onChangeField } = blockProps;

  const [blockId, formData] = addBlock(properties, 'slate', index + 1);

  const options = {
    '@type': 'slate',
    value: cloneDeep(blockValue),
    plaintext: serializeNodesToText(blockValue),
  };

  const newFormData = changeBlock(formData, blockId, options);

  const blocksFieldname = getBlocksFieldname(properties);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);
  // console.log('layout', blocksLayoutFieldname, newFormData);

  ReactDOM.unstable_batchedUpdates(() => {
    blockProps.saveSlateBlockSelection(blockId, 'start');
    onChangeField(blocksFieldname, newFormData[blocksFieldname]);
    onChangeField(blocksLayoutFieldname, newFormData[blocksLayoutFieldname]);
    onSelectBlock(blockId);
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

/**
 * The editor has the properties `dataTransferHandlers` (object) and
 * `dataTransferFormatsOrder` and in `dataTransferHandlers` are functions which
 * sometimes must call this function. Some types of data storeable in Slate
 * documents can be and should be put into separate Volto blocks. The
 * `deconstructToVoltoBlocks` function scans the contents of the Slate document
 * and, through configured Volto block emitters, it outputs separate Volto
 * blocks into the same Volto page form. The `deconstructToVoltoBlocks` function
 * should be called only in key places where it is necessary.
 *
 * @example See the `src/editor/extensions/insertData.js` file.
 *
 * @param {Editor} editor The Slate editor object which should be deconstructed
 * if possible.
 *
 * @returns {Promise}
 */
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
  const { slate } = settings;
  const { voltoBlockEmiters } = slate;

  return new Promise((resolve, reject) => {
    if (!editor?.children) {
      return resolve([]);
    }
    if (editor.children.length === 1) {
      return resolve([blockProps.block]);
    }

    const { properties, onChangeField, onSelectBlock } = editor.getBlockProps();
    const blocksFieldname = getBlocksFieldname(properties);
    const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);

    const { index } = blockProps;
    let blocks = [];

    // TODO: should use Editor.levels() instead of Node.children
    const pathRefs = Array.from(Node.children(editor, [])).map(([, path]) =>
      Editor.pathRef(editor, path),
    );

    for (const pathRef of pathRefs) {
      // extra nodes are always extracted after the text node
      let extras = voltoBlockEmiters
        .map((emit) => emit(editor, pathRef))
        .flat(1);

      // The node might have been replaced with a Volto block
      if (pathRef.current) {
        const [childNode] = Editor.node(editor, pathRef.current);
        if (childNode && !Editor.isEmpty(editor, childNode))
          blocks.push(syncCreateSlateBlock([childNode]));
      }
      blocks = [...blocks, ...extras];
    }

    const blockids = blocks.map((b) => b[0]);

    // TODO: add the placeholder block, because we remove it
    // (when we remove the current block)

    const blocksData = omit(
      {
        ...properties[blocksFieldname],
        ...fromPairs(blocks),
      },
      blockProps.block,
    );
    const layoutData = {
      ...properties[blocksLayoutFieldname],
      items: [
        ...properties[blocksLayoutFieldname].items.slice(0, index),
        ...blockids,
        ...properties[blocksLayoutFieldname].items.slice(index),
      ].filter((id) => id !== blockProps.block),
    };

    ReactDOM.unstable_batchedUpdates(() => {
      onChangeField(blocksFieldname, blocksData);
      onChangeField(blocksLayoutFieldname, layoutData);
      onSelectBlock(blockids[blockids.length - 1]);
      // resolve(blockids);
      // or rather this?
      Promise.resolve().then(resolve(blockids));
    });
  });
}
