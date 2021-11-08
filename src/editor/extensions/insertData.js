import { cloneDeep } from 'lodash';
import {
  Editor,
  Text,
  Transforms,
  Range,
  Path,
  Node,
  createEditor,
  Element,
} from 'slate';
import { deserialize } from 'volto-slate/editor/deserialize';
import { createDefaultBlock, MIMETypeName } from 'volto-slate/utils';
import { normalizeNode } from 'volto-slate/editor/extensions/normalizeNode';

/**
 * The default editor.normalizeNode implementation, modified to put Text's
 * inside p-s when they are directly inside the root node of the editor.
 * @param {*} editor
 * @returns
 */
const generateNormalizeNode = (editor) => (entry) => {
  const [node, path] = entry;

  // There are no core normalizations for text nodes.
  if (Text.isText(node)) {
    return;
  }

  // Ensure that block and inline nodes have at least one text child.
  if (Element.isElement(node) && node.children.length === 0) {
    const child = { text: '' };
    Transforms.insertNodes(editor, child, {
      at: path.concat(0),
      voids: true,
    });
    return;
  }

  // Determine whether the node should have block or inline children.
  const shouldHaveInlines = Editor.isEditor(node)
    ? false
    : Element.isElement(node) &&
    (editor.isInline(node) ||
      node.children.length === 0 ||
      Text.isText(node.children[0]) ||
      editor.isInline(node.children[0]));

  // Since we'll be applying operations while iterating, keep track of an
  // index that accounts for any added/removed nodes.
  let n = 0;

  for (let i = 0; i < node.children.length; i++, n++) {
    const currentNode = Node.get(editor, path);
    if (Text.isText(currentNode)) continue;
    const child = node.children[i];
    const prev = currentNode.children[n - 1];
    const isLast = i === node.children.length - 1;
    const isInlineOrText =
      Text.isText(child) ||
      (Element.isElement(child) && editor.isInline(child));

    // Only allow block nodes in the top-level children and parent blocks
    // that only contain block nodes. Similarly, only allow inline nodes in
    // other inline nodes, or parent blocks that only contain inlines and
    // text.
    if (isInlineOrText !== shouldHaveInlines) {
      // The pasted content can have Text-s directly inside the root, so we do
      // not remove these Text-s but wrap them inside a 'p'.
      if (isInlineOrText && child.text !== '') {
        Transforms.wrapNodes(
          editor,
          // TODO: should here be an empty Text inside children?
          { type: 'p', children: [] },
          {
            at: path.concat(n),
            voids: true,
          },
        );
      } else {
        Transforms.removeNodes(editor, {
          at: path.concat(n),
          voids: true,
        });
        --n;
      }
    } else if (Element.isElement(child)) {
      // Ensure that inline nodes are surrounded by text nodes.
      if (editor.isInline(child)) {
        if (prev == null || !Text.isText(prev)) {
          const newChild = { text: '' };
          Transforms.insertNodes(editor, newChild, {
            at: path.concat(n),
            voids: true,
          });
          n++;
        } else if (isLast) {
          const newChild = { text: '' };
          Transforms.insertNodes(editor, newChild, {
            at: path.concat(n + 1),
            voids: true,
          });
          n++;
        }
      }
    } else {
      // Merge adjacent text nodes that are empty or match.
      if (prev != null && Text.isText(prev)) {
        if (Text.equals(child, prev, { loose: true })) {
          Transforms.mergeNodes(editor, { at: path.concat(n), voids: true });
          n--;
        } else if (prev.text === '') {
          Transforms.removeNodes(editor, {
            at: path.concat(n - 1),
            voids: true,
          });
          n--;
        } else if (child.text === '') {
          Transforms.removeNodes(editor, {
            at: path.concat(n),
            voids: true,
          });
          n--;
        }
      }
    }
  }
};

const normalizeExternalData = (editor, nodes, asInRoot = true) => {
  const [a] = Editor.above(editor, {
    match: (n) => Editor.isBlock(editor, n),
  });

  const type = a.type;

  let fakeEditor = createEditor();
  fakeEditor.children = asInRoot ? nodes : [{ type, children: nodes }];
  fakeEditor.isInline = editor.isInline;
  fakeEditor.isVoid = editor.isVoid;
  fakeEditor.fake = true;
  fakeEditor.normalizeNode = generateNormalizeNode(fakeEditor);
  fakeEditor = normalizeNode(fakeEditor);

  Editor.normalize(fakeEditor, { force: true });

  return fakeEditor.children;
};

export const insertData = (editor) => {
  editor.dataTransferHandlers = {
    ...editor.dataTransferHandlers,
    'application/x-slate-fragment': (dt, fullMime) => {
      const decoded = decodeURIComponent(window.atob(dt));
      const parsed = JSON.parse(decoded);
      editor.beforeInsertFragment && editor.beforeInsertFragment(parsed);
      editor.insertFragment(parsed);

      return true;
    },
    'text/html': (dt, fullMime) => {
      const parsed = new DOMParser().parseFromString(dt, 'text/html');

      const body =
        parsed.getElementsByTagName('google-sheets-html-origin').length > 0
          ? parsed.querySelector('google-sheets-html-origin > table')
          : parsed.body;

      let fragment; //  = deserialize(editor, body);

      const val = deserialize(editor, body);
      fragment = Array.isArray(val) ? val : [val];

      // When there's already text in the editor, insert a fragment, not nodes
      // if (
      //   Editor.string(editor, []) &&
      //   Array.isArray(fragment) &&
      //   fragment.findIndex(
      //     (b) => Editor.isInline(editor, b) || Text.isText(b),
      //   ) > -1
      // ) {
      //   // TODO: we want normalization also when dealing with fragments
      //   // Transforms.insertFragment(editor, fragment);
      //   editor.insertFragment(fragment);
      //   return true;
      // }

      // const { selection } = editor;
      // if (selection && Range.isExpanded(selection)) {
      //   Transforms.delete(editor);
      // }

      // const [a] = Editor.above(editor, {
      //   match: (n) => Editor.isBlock(editor, n),
      // });

      // let _nodes = fragment;
      // let root = { children: [{ type: a.type, children: _nodes }] };

      // for (let i = 0; i < _nodes.length; ++i) {
      //   // TODO: handle other types of Slate blocks too:
      //   if (_nodes[i].type === 'p') {
      //     // the number of children inside the paragraph
      //     const ni = _nodes[i].children.length;

      //     // not sure how to avoid this cloning (it throws error if removing it)
      //     _nodes = cloneDeep(_nodes);

      //     // unwrap the p's contents
      //     _nodes.splice(i, 1, ..._nodes[i].children);

      //     // NOTE: maybe requiring some partial normalization here?
      //     // _nodes = normalizeNodes(editor, _nodes, false);

      //     // a temporary root node for splitting & normalization purposes
      //     root = { children: [{ type: a.type, children: _nodes }] };

      //     // the end point of the last node in the unwrapped nodes' array
      //     let at = end(root, [0, i + ni - 1]);

      //     // the number of levels to split
      //     let height = 2; // does this improve?: `= 1;`

      //     // TODO: merge inlines that have the same properties and are separated
      //     // by empty {text: ''}'s.

      //     let match = (n) => Editor.isBlock(editor, n);

      //     // the closest non-void block to the root starting from the point
      //     // where a paragraph break should be inserted
      //     const [highest] = nodes(editor, root, {
      //       at,
      //       match,
      //       mode: 'lowest',
      //       voids: false,
      //     });

      //     if (highest) {
      //       const voidMatch = voidNode(editor, root, {
      //         at,
      //         mode: 'highest',
      //       });

      //       if (voidMatch) {
      //         const [vn, vp] = voidMatch;

      //         if (editor.isInline(vn)) {
      //           let _after = after(editor, root, vp);

      //           if (!_after) {
      //             const text = { text: '' };
      //             const afterPath = Path.next(vp);
      //             insertNodes(editor, root, text, {
      //               at: afterPath,
      //               voids: false,
      //             });
      //             _after = point(root, afterPath);
      //           }

      //           at = _after;
      //         }

      //         const siblingHeight = at.path.length - vp.length;
      //         height = siblingHeight + 1;
      //       }

      //       // depth at which a paragraph break will be inserted
      //       const depth = at.path.length - height;

      //       // the path of the block in which the break will be inserted
      //       const [, highestPath] = highest;

      //       // the depth at which to start splitting
      //       const lowestPath = at.path.slice(0, depth);

      //       let position =
      //         /* height === 0 ?  */ at.offset; /* : at.path[depth] */

      //       // for each non-void node entry from lowestPath to root
      //       for (const [node, path] of levels(editor, root, {
      //         at: lowestPath,
      //         reverse: true,
      //         voids: false,
      //       })) {
      //         // if highestPath (of the block in which the break will be
      //         // inserted) is longer than the current path or current path is of
      //         // editor or current path is of a void node
      //         if (
      //           path.length < highestPath.length ||
      //           path.length === 0 ||
      //           Editor.isVoid(editor, node)
      //         ) {
      //           break;
      //         }

      //         const properties = Node.extractProps(node);

      //         // BUG: the first call to this modifies `root`1 in a wrong way
      //         // (compare root before and after the call to `apply` below)
      //         apply(editor, root, {
      //           type: 'split_node',
      //           path,
      //           position,
      //           properties,
      //         });

      //         position = path[path.length - 1] + 1;
      //       }
      //     }
      //     --i;
      //   }
      // }

      console.log('before normalization', fragment);

      // external normalization
      fragment = normalizeExternalData(editor, fragment, true);

      console.log('after normalization', fragment);

      // const r = Editor.rangeRef(editor, editor.selection, {
      //   affinity: 'outward',
      // });

      // Volto-Slate paste does introduce a new 'p' so there are 2 'p'-s inside
      // the document and the selection is about the second one, but
      // deconstructToVoltoBlocks has been called so now the selection is
      // invalid.

      // the actual pasting
      Transforms.insertNodes(editor, fragment);

      // Transforms.select(editor, r.current);

      return true;
    },
    'text/plain': (dt, fullMime) => {
      const text = dt;
      if (!text) return;

      const paras = text.split('\n');
      const fragment = paras.map((p) => createDefaultBlock([{ text: p }]));
      // return insertData(data);

      // check if fragment is p with text and insert as fragment if so

      const fragmentContainsText = (f) => {
        var trigger = false;
        if (f && f[0]) {
          f.forEach((frag) => {
            if (frag.type === 'p') {
              if (frag.children) {
                frag.children.forEach((child) => {
                  if (child.text) {
                    trigger = true;
                  }
                });
              }
            }
          });
        }
        return trigger;
      };

      // When there's already text in the editor, insert a fragment, not nodes
      const containsText = fragmentContainsText(fragment);
      if (fragment && containsText) {
        Transforms.insertFragment(editor, fragment);
      }

      if (Editor.string(editor, [])) {
        if (
          Array.isArray(fragment) &&
          fragment.findIndex((b) => Editor.isInline(b) || Text.isText(b)) > -1
        ) {
          // console.log('insert fragment', fragment);
          // TODO: we want normalization also when dealing with fragments
          Transforms.insertFragment(editor, fragment);
          return true;
        }
      }

      const nodes = normalizeExternalData(editor, fragment);
      if (!containsText) {
        Transforms.insertNodes(editor, nodes);
      }

      return true;
    },
  };

  // TODO: use the rtf data to get the embedded images.
  // const text = data.getData('text/rtf');

  const { insertData } = editor;

  // TODO: move this to extensions/insertData
  // TODO: update and improve comments & docs related to
  // `dataTransferFormatsOrder` and `dataTransferHandlers` features
  editor.insertData = (data) => {
    if (editor.beforeInsertData) {
      editor.beforeInsertData(data);
    }

    // debugger;
    for (let i = 0; i < editor.dataTransferFormatsOrder.length; ++i) {
      const dt = editor.dataTransferFormatsOrder[i];
      if (dt === 'files') {
        const { files } = data;
        if (files && files.length > 0) {
          // or handled here
          return editor.dataTransferHandlers['files'](files);
        }
        continue;
      }
      const satisfyingFormats = data.types.filter((y) =>
        new MIMETypeName(dt).matches(new MIMETypeName(y)),
      );
      for (let j = 0; j < satisfyingFormats.length; ++j) {
        const y = satisfyingFormats[j];
        if (editor.dataTransferHandlers[dt](data.getData(y), y)) {
          // handled here
          return true;
        }
      }
    }
    // not handled until this point
    return insertData(data);
  };

  return editor;
};
