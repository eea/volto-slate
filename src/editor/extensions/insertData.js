import { cloneDeep } from 'lodash';
import { Editor, Text, Transforms, Range, Path, Node } from 'slate';
import { deserialize } from 'volto-slate/editor/deserialize';
import {
  createDefaultBlock,
  normalizeNodes,
  MIMETypeName,
  nodes,
  voidNode,
  insertNodes,
  point,
  levels,
  apply,
  after,
  end,
} from 'volto-slate/utils';

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

      const { selection } = editor;
      if (selection && Range.isExpanded(selection)) {
        Transforms.delete(editor);
      }

      const [a] = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });

      let _nodes = fragment;
      let root = { children: [{ type: a.type, children: _nodes }] };

      for (let i = 0; i < _nodes.length; ++i) {
        // TODO: handle other types of Slate blocks too:
        if (_nodes[i].type === 'p') {
          // the number of children inside the paragraph
          const ni = _nodes[i].children.length;

          // not sure how to avoid this cloning (it throws error if removing it)
          _nodes = cloneDeep(_nodes);

          // unwrap the p's contents
          _nodes.splice(i, 1, ..._nodes[i].children);

          // NOTE: maybe requiring some partial normalization here?
          // _nodes = normalizeNodes(editor, _nodes, false);

          // a temporary root node for splitting & normalization purposes
          root = { children: [{ type: a.type, children: _nodes }] };

          // the end point of the last node in the unwrapped nodes' array
          let at = end(root, [0, i + ni - 1]);

          // the number of levels to split
          let height = 2; // does this improve?: `= 1;`

          // TODO: merge inlines that have the same properties and are separated
          // by empty {text: ''}'s.

          let match = (n) => Editor.isBlock(editor, n);

          // the closest non-void block to the root starting from the point
          // where a paragraph break should be inserted
          const [highest] = nodes(editor, root, {
            at,
            match,
            mode: 'lowest',
            voids: false,
          });

          if (highest) {
            const voidMatch = voidNode(editor, root, {
              at,
              mode: 'highest',
            });

            if (voidMatch) {
              const [vn, vp] = voidMatch;

              if (editor.isInline(vn)) {
                let _after = after(editor, root, vp);

                if (!_after) {
                  const text = { text: '' };
                  const afterPath = Path.next(vp);
                  insertNodes(editor, root, text, {
                    at: afterPath,
                    voids: false,
                  });
                  _after = point(root, afterPath);
                }

                at = _after;
              }

              const siblingHeight = at.path.length - vp.length;
              height = siblingHeight + 1;
            }

            // depth at which a paragraph break will be inserted
            const depth = at.path.length - height;

            // the path of the block in which the break will be inserted
            const [, highestPath] = highest;

            // the depth at which to start splitting
            const lowestPath = at.path.slice(0, depth);

            let position =
              /* height === 0 ?  */ at.offset; /* : at.path[depth] */

            // for each non-void node entry from lowestPath to root
            for (const [node, path] of levels(editor, root, {
              at: lowestPath,
              reverse: true,
              voids: false,
            })) {
              // if highestPath (of the block in which the break will be
              // inserted) is longer than the current path or current path is of
              // editor or current path is of a void node
              if (
                path.length < highestPath.length ||
                path.length === 0 ||
                Editor.isVoid(editor, node)
              ) {
                break;
              }

              const properties = Node.extractProps(node);

              // BUG: the first call to this modifies `root`1 in a wrong way
              // (compare root before and after the call to `apply` below)
              apply(editor, root, {
                type: 'split_node',
                path,
                position,
                properties,
              });

              position = path[path.length - 1] + 1;
            }
          }
          --i;
        }
      }

      // external normalization
      normalizeNodes(editor, root.children[0].children, false);

      // the actual pasting
      Transforms.insertNodes(editor, root.children[0].children);

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

      const nodes = normalizeNodes(editor, fragment, true);
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
