import ReactDOM from 'react-dom';
import { v4 as uuid } from 'uuid';
import {
  addBlock,
  changeBlock,
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import { Transforms, Editor, Node, Text, Path, Range } from 'slate';
import { serializeNodesToText } from 'volto-slate/editor/render';
import { omit } from 'lodash';
import config from '@plone/volto/registry';

function fromEntries(pairs) {
  const res = {};
  pairs.forEach((p) => {
    res[p[0]] = p[1];
  });
  return res;
}

/**
 * Convert a range into a point by deleting it's content.
 */

const deleteRange = (editor, range) => {
  if (Range.isCollapsed(range)) {
    return range.anchor;
  } else {
    const [, end] = Range.edges(range);
    const pointRef = Editor.pointRef(editor, end);
    Transforms.delete(editor, { at: range });
    return pointRef.unref();
  }
};

/**
 * Split the nodes at a specific location.
 */
const splitNodes = (editor, options = {}) => {
  Editor.withoutNormalizing(editor, () => {
    const { mode = 'lowest', voids = false } = options;
    let { match, at = editor.selection, height = 0, always = false } = options;

    console.log('TAREEEEEEEE');

    if (match == null) {
      match = (n) => Editor.isBlock(editor, n);
    }

    if (Range.isRange(at)) {
      at = deleteRange(editor, at);
    }

    // If the target is a path, the default height-skipping and position
    // counters need to account for us potentially splitting at a non-leaf.
    if (Path.isPath(at)) {
      const path = at;
      const point = Editor.point(editor, path);
      const [parent] = Editor.parent(editor, path);
      match = (n) => n === parent;
      height = point.path.length - path.length + 1;
      at = point;
      always = true;
    }

    if (!at) {
      return;
    }

    const beforeRef = Editor.pointRef(editor, at, {
      affinity: 'backward',
    });
    const [highest] = Editor.nodes(editor, { at, match, mode, voids });

    if (!highest) {
      return;
    }

    const voidMatch = Editor.void(editor, { at, mode: 'highest' });
    const nudge = 0;

    if (!voids && voidMatch) {
      const [voidNode, voidPath] = voidMatch;

      if (Element.isElement(voidNode) && editor.isInline(voidNode)) {
        let after = Editor.after(editor, voidPath);

        if (!after) {
          const text = { text: '' };
          const afterPath = Path.next(voidPath);
          Transforms.insertNodes(editor, text, { at: afterPath, voids });
          after = Editor.point(editor, afterPath);
        }

        at = after;
        always = true;
      }

      const siblingHeight = at.path.length - voidPath.length;
      height = siblingHeight + 1;
      always = true;
    }

    const afterRef = Editor.pointRef(editor, at);
    const depth = at.path.length - height;
    const [, highestPath] = highest;
    const lowestPath = at.path.slice(0, depth);
    let position =
      /* height === 0 ? */ at.offset; /* : at.path[depth] + nudge */

    const ns = Editor.levels(editor, {
      at: lowestPath,
      reverse: true,
      voids,
    });

    // console.log('nodes', Array.from(ns));

    for (const [node, path] of ns) {
      let split = false;

      if (
        // path.length < highestPath.length ||
        path.length === 0 ||
        (!voids && Editor.isVoid(editor, node))
      ) {
        break;
      }

      const point = beforeRef.current;
      const isEnd = Editor.isEnd(editor, point, path);

      console.log('ETC:', [
        node,
        path,
        point,
        Editor.isEdge(editor, point, path),
      ]);

      // if point is at start/end of path don't split - why?
      if (true || always || !beforeRef || !Editor.isEdge(editor, point, path)) {
        split = true;
        const properties = Node.extractProps(node);
        editor.apply({
          type: 'split_node',
          path,
          position,
          properties,
        });
      }

      position = path[path.length - 1] + (split || isEnd ? 1 : 0);
    }

    if (options.at == null) {
      const point = afterRef.current || Editor.end(editor, []);
      Transforms.select(editor, point);
    }

    beforeRef.unref();
    afterRef.unref();
  });
};

// TODO: should be made generic, no need for "prevBlock.value"
export function mergeSlateWithBlockBackward(editor, prevBlock, event) {
  // To work around current architecture limitations, read the value from
  // previous block. Replace it in the current editor (over which we have
  // control), join with current block value, then use this result for previous
  // block, delete current block

  const prev = prevBlock.value;

  // collapse the selection to its start point
  Transforms.collapse(editor, { edge: 'start' });

  let rangeRef;
  let end;

  Editor.withoutNormalizing(editor, () => {
    // insert block #0 contents in block #1 contents, at the beginning
    Transforms.insertNodes(editor, prev, {
      at: Editor.start(editor, []),
    });

    // the contents that should be moved into the `ul`, as the last `li`
    rangeRef = Editor.rangeRef(editor, {
      anchor: Editor.start(editor, [1]),
      focus: Editor.end(editor, [1]),
    });

    const source = rangeRef.current;

    end = Editor.end(editor, [0]);

    let endPoint;

    Transforms.insertNodes(editor, { text: '' }, { at: end });

    end = Editor.end(editor, [0]);

    Transforms.splitNodes(editor, {
      at: end,
      always: true,
      height: 1,
      mode: 'highest',
      match: (n) => n.type === 'li' || Text.isText(n),
    });

    endPoint = Editor.end(editor, [0]);

    Transforms.moveNodes(editor, {
      at: source,
      to: endPoint.path,
      mode: 'all',
      match: (n, p) => p.length === 2,
    });
  });

  const [n] = Editor.node(editor, [1]);

  if (Editor.isEmpty(editor, n)) {
    Transforms.removeNodes(editor, { at: [1] });
  }

  rangeRef.unref();

  // Transforms.select(editor, Editor.end(editor, [0]));

  end = Editor.end(editor, [0]);

  return end;
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
    value: JSON.parse(JSON.stringify(value)),
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
    value: JSON.parse(JSON.stringify(blockValue)),
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

// //check for existing img children
// const checkContainImg = (elements) => {
//   var check = false;
//   elements.forEach((e) =>
//     e.children.forEach((c) => {
//       if (c && c.type && c.type === 'img') {
//         check = true;
//       }
//     }),
//   );
//   return check;
// };

// //check for existing table children
// const checkContainTable = (elements) => {
//   var check = false;
//   elements.forEach((e) => {
//     if (e && e.type && e.type === 'table') {
//       check = true;
//     }
//   });
//   return check;
// };

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

  if (!editor.getBlockProps) return;

  const blockProps = editor.getBlockProps();
  const { slate } = config.settings;
  const { voltoBlockEmiters } = slate;

  return new Promise((resolve, reject) => {
    if (!editor?.children) return;

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
        ...fromEntries(blocks),
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

    // TODO: use onChangeFormData instead of this API style
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
