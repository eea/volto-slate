import { Editor, Transforms, Range, Point, Node, Path, Span } from 'slate';
import { ReactEditor } from 'slate-react';
import { settings } from '~/config';

export const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = settings.slate.listTypes.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => settings.slate.listTypes.includes(n.type),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

var _marked = /*#__PURE__*/ regeneratorRuntime.mark(nodes);

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it;
  if (typeof Symbol === 'undefined' || o[Symbol.iterator] == null) {
    if (
      Array.isArray(o) ||
      (it = _unsupportedIterableToArray(o)) ||
      (allowArrayLike && o && typeof o.length === 'number')
    ) {
      if (it) o = it;
      var i = 0;
      var F = function F() {};
      return {
        s: F,
        n: function n() {
          if (i >= o.length) return { done: true };
          return { done: false, value: o[i++] };
        },
        e: function e(_e2) {
          throw _e2;
        },
        f: F,
      };
    }
    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
    );
  }
  var normalCompletion = true,
    didErr = false,
    err;
  return {
    s: function s() {
      it = o[Symbol.iterator]();
    },
    n: function n() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function e(_e3) {
      didErr = true;
      err = _e3;
    },
    f: function f() {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    },
  };
}

function _slicedToArray(arr, i) {
  return (
    _arrayWithHoles(arr) ||
    _iterableToArrayLimit(arr, i) ||
    _unsupportedIterableToArray(arr, i) ||
    _nonIterableRest()
  );
}

function _nonIterableRest() {
  throw new TypeError(
    'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
  );
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === 'string') return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === 'Object' && o.constructor) n = o.constructor.name;
  if (n === 'Map' || n === 'Set') return Array.from(o);
  if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === 'undefined' || !(Symbol.iterator in Object(arr)))
    return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;
  try {
    for (
      var _i = arr[Symbol.iterator](), _s;
      !(_n = (_s = _i.next()).done);
      _n = true
    ) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i['return'] != null) _i['return']();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function nodes(editor) {
  var options,
    _options$at,
    at,
    _options$mode,
    mode,
    _options$universal,
    universal,
    _options$reverse,
    reverse,
    _options$voids,
    voids,
    match,
    from,
    to,
    first,
    last,
    iterable,
    matches,
    hit,
    _iterator,
    _step,
    _step$value,
    node,
    path,
    isLower,
    emit,
    _args = arguments;

  return regeneratorRuntime.wrap(
    function nodes$(_context) {
      while (1) {
        switch ((_context.prev = _context.next)) {
          case 0:
            options =
              _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
            (_options$at = options.at),
              (at = _options$at === void 0 ? editor.selection : _options$at),
              (_options$mode = options.mode),
              (mode = _options$mode === void 0 ? 'all' : _options$mode),
              (_options$universal = options.universal),
              (universal =
                _options$universal === void 0 ? false : _options$universal),
              (_options$reverse = options.reverse),
              (reverse =
                _options$reverse === void 0 ? false : _options$reverse),
              (_options$voids = options.voids),
              (voids = _options$voids === void 0 ? false : _options$voids);
            match = options.match;

            if (!match) {
              match = function match() {
                return true;
              };
            }

            if (at) {
              _context.next = 6;
              break;
            }

            return _context.abrupt('return');

          case 6:
            if (Span.isSpan(at)) {
              from = at[0];
              to = at[1];
            } else {
              first = Editor.path(editor, at, {
                edge: 'start',
              });
              last = Editor.path(editor, at, {
                edge: 'end',
              });
              from = reverse ? last : first;
              to = reverse ? first : last;
            }

            iterable = Node.nodes(editor, {
              reverse: reverse,
              from: from,
              to: to,
              pass: function pass(_ref) {
                var _ref2 = _slicedToArray(_ref, 1),
                  n = _ref2[0];

                return voids ? false : Editor.isVoid(editor, n);
              },
            });
            matches = [];
            _iterator = _createForOfIteratorHelper(iterable);
            _context.prev = 10;

            _iterator.s();

          case 12:
            if ((_step = _iterator.n()).done) {
              _context.next = 37;
              break;
            }

            (_step$value = _slicedToArray(_step.value, 2)),
              (node = _step$value[0]),
              (path = _step$value[1]);
            isLower = hit && Path.compare(path, hit[1]) === 0; // In highest mode any node lower than the last hit is not a match.

            if (!(mode === 'highest' && isLower)) {
              _context.next = 17;
              break;
            }

            return _context.abrupt('continue', 35);

          case 17:
            if (match(node)) {
              _context.next = 23;
              break;
            }

            if (!(universal && !isLower && Text.isText(node))) {
              _context.next = 22;
              break;
            }

            return _context.abrupt('return');

          case 22:
            return _context.abrupt('continue', 35);

          case 23:
            if (!(mode === 'lowest' && isLower)) {
              _context.next = 26;
              break;
            }

            hit = [node, path];
            return _context.abrupt('continue', 35);

          case 26:
            // In lowest mode we emit the last hit, once it's guaranteed lowest.
            emit = mode === 'lowest' ? hit : [node, path];

            if (!emit) {
              _context.next = 34;
              break;
            }

            if (!universal) {
              _context.next = 32;
              break;
            }

            matches.push(emit);
            _context.next = 34;
            break;

          case 32:
            _context.next = 34;
            return emit;

          case 34:
            hit = [node, path];

          case 35:
            _context.next = 12;
            break;

          case 37:
            _context.next = 42;
            break;

          case 39:
            _context.prev = 39;
            _context.t0 = _context['catch'](10);

            _iterator.e(_context.t0);

          case 42:
            _context.prev = 42;

            _iterator.f();

            return _context.finish(42);

          case 45:
            if (!(mode === 'lowest' && hit)) {
              _context.next = 52;
              break;
            }

            if (!universal) {
              _context.next = 50;
              break;
            }

            matches.push(hit);
            _context.next = 52;
            break;

          case 50:
            _context.next = 52;
            return hit;

          case 52:
            if (!universal) {
              _context.next = 54;
              break;
            }

            return _context.delegateYield(matches, 't1', 54);

          case 54:
          case 'end':
            return _context.stop();
        }
      }
    },
    _marked,
    null,
    [[10, 39, 42, 45]],
  );
}

export const isBlockActive = (editor, format) => {
  const result = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });

  if (!result || !result[Symbol.iterator]) {
    return false;
  }

  try {
    let count = 0;
    let first = null;
    for (let r of result) {
      let x = r[0];
      if (!x) {
        continue;
      }
      if (count === 0) {
        first = x;
      }
      ++count;
    }

    if (count === 0) {
      return false;
    }

    return !!first;
  } catch (ex) {
    return false;
    console.log('EXCEPTION', ex);
    console.log('editor.children', editor.children);
  }

  // const match = Editor.above(editor, {
  //   match: (n) => n.type === format,
  // });

  // if (!match) return false;

  // const [node] = match;
  // return !!node;
};

export const isMarkActive = (editor, format) => {
  let marks;
  try {
    marks = Editor.marks(editor);
  } catch (ex) {
    // bug in Slate, recently appears only in Cypress context, more exactly when I press Enter inside a numbered list first item to produce a split (resulting two list items) (not sure if manually inside the Cypress browser but automatically it surely appears)
    // if (
    //   ex.message ===
    //   'Cannot get the leaf node at path [0,0] because it refers to a non-leaf node: [object Object]' // also with [0,1]
    // ) {
    marks = null;
    // } else {
    //   throw ex;
    // }
  }
  return marks ? marks[format] === true : false;
};

// TODO: this should be in a separate file (maybe in a plugin?)
export const withDelete = (editor) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          Transforms.setNodes(editor, { type: 'paragraph' });

          if (block.type === 'list-item') {
            Transforms.unwrapNodes(editor, {
              match: (n) => n.type === 'bulleted-list',
              split: true,
            });
          }

          return;
        }
      }
      deleteBackward(...args);
    } else {
      deleteBackward(1);
    }
  };

  return editor;
};

/**
 * On insert break at the start of an empty block in types,
 * replace it with a new paragraph.
 * TODO: this should be in a separate file (maybe in a plugin?)
 */
export const breakEmptyReset = ({ types, typeP }) => (editor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const currentNodeEntry = Editor.above(editor, {
      match: (n) => Editor.isBlock(editor, n),
    });

    if (currentNodeEntry) {
      const [currentNode] = currentNodeEntry;

      if (Node.string(currentNode).length === 0) {
        const parent = Editor.above(editor, {
          match: (n) =>
            types.includes(
              typeof n.type === 'undefined' ? n.type : n.type.toString(),
            ),
        });

        if (parent) {
          Transforms.setNodes(editor, { type: typeP });
          Transforms.splitNodes(editor);
          Transforms.liftNodes(editor);

          return;
        }
      }
    }

    insertBreak();
  };

  return editor;
};

// TODO: remake this to be pure Slate code, no DOM, if possible
export const fixSelection = (editor) => {
  if (!editor.selection) {
    const sel = window.getSelection();

    // in unit tests (jsdom) sel is null
    if (sel) {
      const s = ReactEditor.toSlateRange(editor, sel);
      // console.log('selection range', s);
      editor.selection = s;
    }
    // See also dicussions in https://github.com/ianstormtaylor/slate/pull/3652
    // console.log('fixing selection', JSON.stringify(sel), editor.selection);
    // sel.collapse(
    //   sel.focusNode,
    //   sel.anchorOffset > 0 ? sel.anchorOffset - 1 : 0,
    // );
    // sel.collapse(
    //   sel.focusNode,
    //   sel.anchorOffset > 0 ? sel.anchorOffset + 1 : 0,
    // );
  }
};

// In the isCursorAtBlockStart/End functions maybe use a part of these pieces of code:
// Range.isCollapsed(editor.selection) &&
// Point.equals(editor.selection.anchor, Editor.start(editor, []))

export function isCursorAtBlockStart(editor) {
  // fixSelection(editor);

  // if the selection is collapsed
  if (editor.selection && Range.isCollapsed(editor.selection)) {
    // if the selection is at root block or in the first block
    if (
      !editor.selection.anchor.path ||
      editor.selection.anchor.path[0] === 0
    ) {
      // if the selection is on the first character of that block
      if (editor.selection.anchor.offset === 0) {
        return true;
      }
    }
  }
  return false;
}

export function isCursorAtBlockEnd(editor) {
  // fixSelection(editor);

  // if the selection is collapsed
  if (editor.selection && Range.isCollapsed(editor.selection)) {
    const anchor = editor.selection?.anchor || {};

    // the last block node in the editor
    const [n] = Node.last(editor, []);

    if (
      // if the node with the selection is the last block node
      Node.get(editor, anchor.path) === n &&
      // if the collapsed selection is at the end of the last block node
      anchor.offset === n.text.length
    ) {
      return true;
    }
  }
  return false;
}
