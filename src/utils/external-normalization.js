/**
 * Functions taken from aproximatively this commit:
 * https://github.com/ianstormtaylor/slate/tree/slate%400.66.5 and adapted to
 * work not on an editor but on an editor and an external data structure. So,
 * for example, it takes into account which nodes are inlines based on
 * editor.isInline but it changes the `root` node, not the given editor.
 *
 * TODO: update all the functions to be for sure from the above-linked commit,
 * or a later one and put a permalink here to it.
 */

import {
  Path,
  Point,
  Span,
  Node,
  Range,
  Editor,
  Text,
  Element,
  PathRef,
  PointRef,
  RangeRef,
  Transforms,
} from 'slate';
import {
  getWordDistance,
  getCharacterDistance,
  splitByCharacterDistance,
} from './slate-string-utils';
import { createDraft, finishDraft } from 'immer';

/**
 * Get the start or end point of a location.
 */
export const point = (root, at, options = {}) => {
  const { edge = 'start' } = options;

  if (Path.isPath(at)) {
    let path;

    if (edge === 'end') {
      const [, lastPath] = Node.last(root, at);
      path = lastPath;
    } else {
      const [, firstPath] = Node.first(root, at);
      path = firstPath;
    }

    const node = Node.get(root, path);

    if (!Text.isText(node)) {
      throw new Error(
        `Cannot get the ${edge} point in the node at path [${at}] because it has no ${edge} text node.`,
      );
    }

    return { path, offset: edge === 'end' ? node.text.length : 0 };
  }

  if (Range.isRange(at)) {
    const [start, end] = Range.edges(at);
    return edge === 'start' ? start : end;
  }

  return at;
};

/**
 * Get the start point of a location.
 */
export const start = (root, at) => {
  return point(root, at, { edge: 'start' });
};

/**
 * Get the end point of a location.
 */

export const end = (root, at) => {
  return point(root, at, { edge: 'end' });
};

/**
 * Get a range of a location.
 */
export const range = (root, at, to) => {
  if (Range.isRange(at) && !to) {
    return at;
  }

  const _start = start(root, at);
  const _end = end(root, to || at);
  return { anchor: _start, focus: _end };
};

/**
 * Get the path of a location.
 */
export const path = (root, at, options = {}) => {
  const { depth, edge } = options;

  if (Path.isPath(at)) {
    if (edge === 'start') {
      const [, firstPath] = Node.first(root, at);
      at = firstPath;
    } else if (edge === 'end') {
      const [, lastPath] = Node.last(root, at);
      at = lastPath;
    }
  }

  if (Range.isRange(at)) {
    if (edge === 'start') {
      at = Range.start(at);
    } else if (edge === 'end') {
      at = Range.end(at);
    } else {
      at = Path.common(at.anchor.path, at.focus.path);
    }
  }

  if (Point.isPoint(at)) {
    at = at.path;
  }

  if (depth != null) {
    at = at.slice(0, depth);
  }

  return at;
};

/**
 * Iterate through all of the nodes in the Editor.
 */
export const nodes = function* (editor, root, options = {}) {
  const {
    at = null,
    mode = 'all',
    universal = false,
    reverse = false,
    voids = false,
  } = options;
  let { match } = options;

  if (!match) {
    match = () => true;
  }

  if (!at) {
    return;
  }

  let from;
  let to;

  if (Span.isSpan(at)) {
    from = at[0];
    to = at[1];
  } else {
    const first = path(root, at, { edge: 'start' });
    const last = path(root, at, { edge: 'end' });
    from = reverse ? last : first;
    to = reverse ? first : last;
  }

  const nodeEntries = Node.nodes(root, {
    reverse,
    from,
    to,
    pass: ([n]) => (voids ? false : Editor.isVoid(editor, n)),
  });

  const matches = [];
  let hit;

  for (const [node, path] of nodeEntries) {
    const isLower = hit && Path.compare(path, hit[1]) === 0;

    // In highest mode any node lower than the last hit is not a match.
    if (mode === 'highest' && isLower) {
      continue;
    }

    if (!match(node, path)) {
      // If we've arrived at a leaf text node that is not lower than the last
      // hit, then we've found a branch that doesn't include a match, which
      // means the match is not universal.
      if (universal && !isLower && Text.isText(node)) {
        return;
      } else {
        continue;
      }
    }

    // If there's a match and it's lower than the last, update the hit.
    if (mode === 'lowest' && isLower) {
      hit = [node, path];
      continue;
    }

    // In lowest mode we emit the last hit, once it's guaranteed lowest.
    const emit = mode === 'lowest' ? hit : [node, path];

    if (emit) {
      if (universal) {
        matches.push(emit);
      } else {
        yield emit;
      }
    }

    hit = [node, path];
  }

  // Since lowest is always emitting one behind, catch up at the end.
  if (mode === 'lowest' && hit) {
    if (universal) {
      matches.push(hit);
    } else {
      yield hit;
    }
  }

  // Universal defers to ensure that the match occurs in every branch, so we
  // yield all of the matches after iterating.
  if (universal) {
    yield* matches;
  }
};

/**
 * Get the text string content of a location.
 *
 * Note: by default the text of void nodes is considered to be an empty
 * string, regardless of content, unless you pass in true for the voids option
 */
export const string = (editor, root, at, options = {}) => {
  const { voids = false } = options;
  const _range = range(root, at);
  const [start, end] = Range.edges(_range);
  let text = '';

  for (const [node, path] of nodes(editor, root, {
    at: _range,
    match: Text.isText,
    voids,
  })) {
    let t = node.text;

    if (Path.equals(path, end.path)) {
      t = t.slice(0, end.offset);
    }

    if (Path.equals(path, start.path)) {
      t = t.slice(start.offset);
    }

    text += t;
  }

  return text;
};

/**
 * Return all the positions in `at` range where a `Point` can be placed.
 *
 * By default, moves forward by individual offsets at a time, but
 * the `unit` option can be used to to move by character, word, line, or block.
 *
 * The `reverse` option can be used to change iteration direction.
 *
 * Note: By default void nodes are treated as a single point and iteration
 * will not happen inside their content unless you pass in true for the
 * `voids` option, then iteration will occur.
 */
export const positions = function* (editor, root, options = {}) {
  const {
    at = null,
    unit = 'offset',
    reverse = false,
    voids = false,
  } = options;

  if (!at) {
    return;
  }

  /**
   * Algorithm notes:
   *
   * Each step `distance` is dynamic depending on the underlying text
   * and the `unit` specified.  Each step, e.g., a line or word, may
   * span multiple text nodes, so we iterate through the text both on
   * two levels in step-sync:
   *
   * `leafText` stores the text on a text leaf level, and is advanced
   * through using the counters `leafTextOffset` and `leafTextRemaining`.
   *
   * `blockText` stores the text on a block level, and is shortened
   * by `distance` every time it is advanced.
   *
   * We only maintain a window of one blockText and one leafText because
   * a block node always appears before all of its leaf nodes.
   */

  const _range = range(root, at);
  const [_start, _end] = Range.edges(_range);
  const first = reverse ? _end : _start;
  let isNewBlock = false;
  let blockText = '';
  let distance = 0; // Distance for leafText to catch up to blockText.
  let leafTextRemaining = 0;
  let leafTextOffset = 0;

  // Iterate through all nodes in range, grabbing entire textual content
  // of block nodes in blockText, and text nodes in leafText.
  // Exploits the fact that nodes are sequenced in such a way that we first
  // encounter the block node, then all of its text nodes, so when iterating
  // through the blockText and leafText we just need to remember a window of
  // one block node and leaf node, respectively.
  for (const [node, path] of nodes(editor, root, { at, reverse, voids })) {
    /*
     * ELEMENT NODE - Yield position(s) for voids, collect blockText for blocks
     */
    if (Element.isElement(node)) {
      // Void nodes are a special case, so by default we will always
      // yield their first point. If the `voids` option is set to true,
      // then we will iterate over their content.
      if (!voids && editor.isVoid(node)) {
        yield start(root, path);
        continue;
      }

      // Inline element nodes are ignored as they don't themselves
      // contribute to `blockText` or `leafText` - their parent and
      // children do.
      if (editor.isInline(node)) continue;

      // Block element node - set `blockText` to its text content.
      if (Editor.hasInlines(editor, node)) {
        // We always exhaust block nodes before encountering a new one:
        //   console.assert(blockText === '',
        //     `blockText='${blockText}' - `+
        //     `not exhausted before new block node`, path)

        // Ensure range considered is capped to `range`, in the
        // start/end edge cases where block extends beyond range.
        // Equivalent to this, but presumably more performant:
        //   blockRange = Editor.range(editor, ...Editor.edges(editor, path))
        //   blockRange = Range.intersection(range, blockRange) // intersect
        //   blockText = Editor.string(editor, blockRange, { voids })
        const e = Path.isAncestor(path, _end.path) ? _end : end(root, path);
        const s = Path.isAncestor(path, _start.path)
          ? _start
          : start(root, path);

        blockText = string(editor, root, { anchor: s, focus: e }, { voids });
        isNewBlock = true;
      }
    }

    /*
     * TEXT LEAF NODE - Iterate through text content, yielding
     * positions every `distance` offset according to `unit`.
     */
    if (Text.isText(node)) {
      const isFirst = Path.equals(path, first.path);

      // Proof that we always exhaust text nodes before encountering a new one:
      //   console.assert(leafTextRemaining <= 0,
      //     `leafTextRemaining=${leafTextRemaining} - `+
      //     `not exhausted before new leaf text node`, path)

      // Reset `leafText` counters for new text node.
      if (isFirst) {
        leafTextRemaining = reverse
          ? first.offset
          : node.text.length - first.offset;
        leafTextOffset = first.offset; // Works for reverse too.
      } else {
        leafTextRemaining = node.text.length;
        leafTextOffset = reverse ? leafTextRemaining : 0;
      }

      // Yield position at the start of node (potentially).
      if (isFirst || isNewBlock || unit === 'offset') {
        yield { path, offset: leafTextOffset };
        isNewBlock = false;
      }

      // Yield positions every (dynamically calculated) `distance` offset.
      while (true) {
        // If `leafText` has caught up with `blockText` (distance=0),
        // and if blockText is exhausted, break to get another block node,
        // otherwise advance blockText forward by the new `distance`.
        if (distance === 0) {
          if (blockText === '') break;
          distance = calcDistance(blockText, unit, reverse);
          // Split the string at the previously found distance and use the
          // remaining string for the next iteration.
          blockText = splitByCharacterDistance(blockText, distance, reverse)[1];
        }

        // Advance `leafText` by the current `distance`.
        leafTextOffset = reverse
          ? leafTextOffset - distance
          : leafTextOffset + distance;
        leafTextRemaining = leafTextRemaining - distance;

        // If `leafText` is exhausted, break to get a new leaf node
        // and set distance to the overflow amount, so we'll (maybe)
        // catch up to blockText in the next leaf text node.
        if (leafTextRemaining < 0) {
          distance = -leafTextRemaining;
          break;
        }

        // Successfully walked `distance` offsets through `leafText`
        // to catch up with `blockText`, so we can reset `distance`
        // and yield this position in this node.
        distance = 0;
        yield { path, offset: leafTextOffset };
      }
    }
  }
  // Proof that upon completion, we've exahusted both leaf and block text:
  //   console.assert(leafTextRemaining <= 0, "leafText wasn't exhausted")
  //   console.assert(blockText === '', "blockText wasn't exhausted")

  // Helper:
  // Return the distance in offsets for a step of size `unit` on given string.
  function calcDistance(text, unit, reverse) {
    if (unit === 'character') {
      return getCharacterDistance(text, reverse);
    } else if (unit === 'word') {
      return getWordDistance(text, reverse);
    } else if (unit === 'line' || unit === 'block') {
      return text.length;
    }
    return 1;
  }
};

/**
 * Get the point before a location.
 */
export const before = (editor, root, at, options = {}) => {
  const anchor = start(root, []);
  const focus = point(root, at, { edge: 'start' });
  const range = { anchor, focus };
  const { distance = 1 } = options;
  let d = 0;
  let target;

  for (const p of positions(editor, root, {
    ...options,
    at: range,
    reverse: true,
  })) {
    if (d > distance) {
      break;
    }

    if (d !== 0) {
      target = p;
    }

    d++;
  }

  return target;
};

/**
 * Get the node at a location.
 */
export const node = (root, at, options = {}) => {
  const _path = path(root, at, options);
  const node = Node.get(root, _path);
  return [node, _path];
};

/**
 * Get the first node at a location.
 */
export const first = (editor, root, at) => {
  const _path = path(root, at, { edge: 'start' });
  return Editor.node(editor, _path);
};

/**
 * Get the parent node of a location.
 */
export const parent = (root, at, options = {}) => {
  const _path = path(root, at, options);
  const parentPath = Path.parent(_path);
  const entry = node(root, parentPath);
  return entry;
};

/**
 * Get the matching node in the branch of the document before a location.
 */
export const previous = (editor, root, options = {}) => {
  const { mode = 'lowest', voids = false } = options;
  let { match, at = null } = options;

  if (!at) {
    return;
  }

  const pointBeforeLocation = before(editor, root, at, { voids });

  if (!pointBeforeLocation) {
    return;
  }

  const [, to] = first(editor, root, []);

  // The search location is from the start of the document to the path of
  // the point before the location passed in
  const span = [pointBeforeLocation.path, to];

  if (Path.isPath(at) && at.length === 0) {
    throw new Error(`Cannot get the previous node from the root node!`);
  }

  if (match == null) {
    if (Path.isPath(at)) {
      const [_parent] = parent(root, at);
      match = (n) => _parent.children.includes(n);
    } else {
      match = () => true;
    }
  }

  const [previous] = nodes(editor, root, {
    reverse: true,
    at: span,
    match,
    mode,
    voids,
  });

  return previous;
};

/**
 * Iterate through all of the levels at a location.
 */
export const levels = function* (editor, root, options = {}) {
  const { at = null, reverse = false, voids = false } = options;
  let { match } = options;

  if (match == null) {
    match = () => true;
  }

  if (!at) {
    return;
  }

  const levels = [];
  const _path = path(root, at);

  for (const [n, p] of Node.levels(editor, _path)) {
    if (!match(n, p)) {
      continue;
    }

    levels.push([n, p]);

    if (!voids && Editor.isVoid(editor, n)) {
      break;
    }
  }

  if (reverse) {
    levels.reverse();
  }

  yield* levels;
};

export const above = (editor, root, options = {}) => {
  const { voids = false, mode = 'lowest', at = null, match } = options;

  if (!at) {
    return;
  }

  const _path = path(root, at);
  const reverse = mode === 'lowest';

  for (const [n, p] of levels(editor, root, {
    at: _path,
    voids,
    match,
    reverse,
  })) {
    if (!Text.isText(n) && !Path.equals(_path, p)) {
      return [n, p];
    }
  }
};

/**
 * Convert a range into a non-hanging one.
 */
export const unhangRange = (editor, root, range, options = {}) => {
  const { voids = false } = options;
  let [_start, _end] = Range.edges(range);

  // PERF: exit early if we can guarantee that the range isn't hanging.
  if (_start.offset !== 0 || _end.offset !== 0 || Range.isCollapsed(range)) {
    return range;
  }

  const endBlock = above(editor, root, {
    at: _end,
    match: (n) => Editor.isBlock(editor, n),
  });
  const blockPath = endBlock ? endBlock[1] : [];
  const first = start(root, []);
  const before = { anchor: first, focus: _end };
  let skip = true;

  for (const [node, path] of nodes(editor, root, {
    at: before,
    match: Text.isText,
    reverse: true,
    voids,
  })) {
    if (skip) {
      skip = false;
      continue;
    }

    if (node.text !== '' || Path.isBefore(path, blockPath)) {
      _end = { path, offset: node.text.length };
      break;
    }
  }

  return { anchor: _start, focus: _end };
};

const hasSingleChildNest = (editor, node) => {
  if (Element.isElement(node)) {
    const element = node;
    if (Editor.isVoid(editor, node)) {
      return true;
    } else if (element.children.length === 1) {
      return hasSingleChildNest(editor, element.children[0]);
    } else {
      return false;
    }
  } else if (Editor.isEditor(node)) {
    return false;
  } else {
    return true;
  }
};

const matchPath = (root, path) => {
  const [_node] = node(root, path);
  return (n) => n === _node;
};

const PATH_REFS = new WeakMap();

/**
 * Get the set of currently tracked path refs of the editor.
 */
export const pathRefs = (root) => {
  let refs = PATH_REFS.get(root);

  if (!refs) {
    refs = new Set();
    PATH_REFS.set(root, refs);
  }

  return refs;
};

/**
 * Create a mutable ref for a `Path` object, which will stay in sync as new
 * operations are applied to the editor.
 */
export const pathRef = (root, path, options = {}) => {
  const { affinity = 'forward' } = options;
  const ref = {
    current: path,
    affinity,
    unref() {
      const { current } = ref;
      const _pathRefs = pathRefs(root);
      _pathRefs.delete(ref);
      ref.current = null;
      return current;
    },
  };

  const refs = pathRefs(root);
  refs.add(ref);
  return ref;
};

const POINT_REFS = new WeakMap();

/**
 * Get the set of currently tracked point refs of the editor.
 */
export const pointRefs = (root) => {
  let refs = POINT_REFS.get(root);

  if (!refs) {
    refs = new Set();
    POINT_REFS.set(root, refs);
  }

  return refs;
};

const RANGE_REFS = new WeakMap();

/**
 * Get the set of currently tracked range refs of the editor.
 */
export const rangeRefs = (root) => {
  let refs = RANGE_REFS.get(root);

  if (!refs) {
    refs = new Set();
    RANGE_REFS.set(root, refs);
  }

  return refs;
};

/**
 * Create a mutable ref for a `Range` object, which will stay in sync as new
 * operations are applied to the editor.
 */
export const rangeRef = (editor, range, options = {}) => {
  const { affinity = 'forward' } = options;
  const ref = {
    current: range,
    affinity,
    unref() {
      const { current } = ref;
      const rangeRefs = Editor.rangeRefs(editor);
      rangeRefs.delete(ref);
      ref.current = null;
      return current;
    },
  };

  const refs = Editor.rangeRefs(editor);
  refs.add(ref);
  return ref;
};

/**
 * Get the "dirty" paths generated from an operation.
 */
const getDirtyPaths = (op) => {
  switch (op.type) {
    case 'insert_text':
    case 'remove_text':
    case 'set_node': {
      const { path } = op;
      return Path.levels(path);
    }

    case 'insert_node': {
      const { node, path } = op;
      const levels = Path.levels(path);
      const descendants = Text.isText(node)
        ? []
        : Array.from(Node.nodes(node), ([, p]) => path.concat(p));

      return [...levels, ...descendants];
    }

    case 'merge_node': {
      const { path } = op;
      const ancestors = Path.ancestors(path);
      const previousPath = Path.previous(path);
      return [...ancestors, previousPath];
    }

    case 'move_node': {
      const { path, newPath } = op;

      if (Path.equals(path, newPath)) {
        return [];
      }

      const oldAncestors = [];
      const newAncestors = [];

      for (const ancestor of Path.ancestors(path)) {
        const p = Path.transform(ancestor, op);
        oldAncestors.push(p);
      }

      for (const ancestor of Path.ancestors(newPath)) {
        const p = Path.transform(ancestor, op);
        newAncestors.push(p);
      }

      const newParent = newAncestors[newAncestors.length - 1];
      const newIndex = newPath[newPath.length - 1];
      const resultPath = newParent.concat(newIndex);

      return [...oldAncestors, ...newAncestors, resultPath];
    }

    case 'remove_node': {
      const { path } = op;
      const ancestors = Path.ancestors(path);
      return [...ancestors];
    }

    case 'split_node': {
      const { path } = op;
      const levels = Path.levels(path);
      const nextPath = Path.next(path);
      return [...levels, nextPath];
    }

    default: {
      return [];
    }
  }
};

const applyToDraft = (root, selection, op) => {
  switch (op.type) {
    case 'insert_node': {
      const { path, node } = op;
      const parent = Node.parent(root, path);
      const index = path[path.length - 1];

      if (index > parent.children.length) {
        throw new Error(
          `Cannot apply an "insert_node" operation at path [${path}] because the destination is past the end of the node.`,
        );
      }

      parent.children.splice(index, 0, node);

      if (selection) {
        for (const [point, key] of Range.points(selection)) {
          selection[key] = Point.transform(point, op);
        }
      }

      break;
    }

    case 'insert_text': {
      const { path, offset, text } = op;
      if (text.length === 0) break;
      const node = Node.leaf(root, path);
      const before = node.text.slice(0, offset);
      const after = node.text.slice(offset);
      node.text = before + text + after;

      if (selection) {
        for (const [point, key] of Range.points(selection)) {
          selection[key] = Point.transform(point, op);
        }
      }

      break;
    }

    case 'merge_node': {
      const { path } = op;
      const node = Node.get(root, path);
      const prevPath = Path.previous(path);
      const prev = Node.get(root, prevPath);
      const parent = Node.parent(root, path);
      const index = path[path.length - 1];

      if (Text.isText(node) && Text.isText(prev)) {
        prev.text += node.text;
      } else if (!Text.isText(node) && !Text.isText(prev)) {
        prev.children.push(...node.children);
      } else {
        throw new Error(
          `Cannot apply a "merge_node" operation at path [${path}] to nodes of different interfaces: ${node} ${prev}`,
        );
      }

      parent.children.splice(index, 1);

      if (selection) {
        for (const [point, key] of Range.points(selection)) {
          selection[key] = Point.transform(point, op);
        }
      }

      break;
    }

    case 'move_node': {
      const { path, newPath } = op;

      if (Path.isAncestor(path, newPath)) {
        throw new Error(
          `Cannot move a path [${path}] to new path [${newPath}] because the destination is inside itself.`,
        );
      }

      const node = Node.get(root, path);
      const parent = Node.parent(root, path);
      const index = path[path.length - 1];

      // This is tricky, but since the `path` and `newPath` both refer to
      // the same snapshot in time, there's a mismatch. After either
      // removing the original position, the second step's path can be out
      // of date. So instead of using the `op.newPath` directly, we
      // transform `op.path` to ascertain what the `newPath` would be after
      // the operation was applied.
      parent.children.splice(index, 1);
      const truePath = Path.transform(path, op);
      const newParent = Node.get(root, Path.parent(truePath));
      const newIndex = truePath[truePath.length - 1];

      newParent.children.splice(newIndex, 0, node);

      if (selection) {
        for (const [point, key] of Range.points(selection)) {
          selection[key] = Point.transform(point, op);
        }
      }

      break;
    }

    case 'remove_node': {
      const { path } = op;
      const index = path[path.length - 1];
      const parent = Node.parent(root, path);
      parent.children.splice(index, 1);

      // Transform all of the points in the value, but if the point was in the
      // node that was removed we need to update the range or remove it.
      if (selection) {
        for (const [point, key] of Range.points(selection)) {
          const result = Point.transform(point, op);

          if (selection != null && result != null) {
            selection[key] = result;
          } else {
            let prev;
            let next;

            for (const [n, p] of Node.texts(root)) {
              if (Path.compare(p, path) === -1) {
                prev = [n, p];
              } else {
                next = [n, p];
                break;
              }
            }

            let preferNext = false;
            if (prev && next) {
              if (Path.equals(next[1], path)) {
                preferNext = !Path.hasPrevious(next[1]);
              } else {
                preferNext =
                  Path.common(prev[1], path).length <
                  Path.common(next[1], path).length;
              }
            }

            if (prev && !preferNext) {
              point.path = prev[1];
              point.offset = prev[0].text.length;
            } else if (next) {
              point.path = next[1];
              point.offset = 0;
            } else {
              selection = null;
            }
          }
        }
      }

      break;
    }

    case 'remove_text': {
      const { path, offset, text } = op;
      if (text.length === 0) break;
      const node = Node.leaf(root, path);
      const before = node.text.slice(0, offset);
      const after = node.text.slice(offset + text.length);
      node.text = before + after;

      if (selection) {
        for (const [point, key] of Range.points(selection)) {
          selection[key] = Point.transform(point, op);
        }
      }

      break;
    }

    case 'set_node': {
      const { path, properties, newProperties } = op;

      if (path.length === 0) {
        throw new Error(`Cannot set properties on the root node!`);
      }

      const node = Node.get(root, path);

      for (const key in newProperties) {
        if (key === 'children' || key === 'text') {
          throw new Error(`Cannot set the "${key}" property of nodes!`);
        }

        const value = newProperties[key];

        if (value == null) {
          delete node[key];
        } else {
          node[key] = value;
        }
      }

      // properties that were previously defined, but are now missing, must be deleted
      for (const key in properties) {
        if (!newProperties.hasOwnProperty(key)) {
          delete node[key];
        }
      }

      break;
    }

    case 'set_selection': {
      const { newProperties } = op;

      if (newProperties == null) {
        selection = newProperties;
      } else {
        if (selection == null) {
          if (!Range.isRange(newProperties)) {
            throw new Error(
              `Cannot apply an incomplete "set_selection" operation properties ${JSON.stringify(
                newProperties,
              )} when there is no current selection.`,
            );
          }

          selection = { ...newProperties };
        }

        for (const key in newProperties) {
          const value = newProperties[key];

          if (value == null) {
            if (key === 'anchor' || key === 'focus') {
              throw new Error(`Cannot remove the "${key}" selection property`);
            }

            delete selection[key];
          } else {
            selection[key] = value;
          }
        }
      }

      break;
    }

    case 'split_node': {
      const { path, position, properties } = op;

      if (path.length === 0) {
        throw new Error(
          `Cannot apply a "split_node" operation at path [${path}] because the root node cannot be split.`,
        );
      }

      const node = Node.get(root, path);
      const parent = Node.parent(root, path);
      const index = path[path.length - 1];
      let newNode;

      if (Text.isText(node)) {
        const before = node.text.slice(0, position);
        const after = node.text.slice(position);
        node.text = before;
        newNode = {
          ...properties,
          text: after,
        };
      } else {
        const before = node.children.slice(0, position);
        const after = node.children.slice(position);
        node.children = before;

        newNode = {
          ...properties,
          children: after,
        };
      }

      parent.children.splice(index + 1, 0, newNode);

      if (selection) {
        for (const [point, key] of Range.points(selection)) {
          selection[key] = Point.transform(point, op);
        }
      }

      break;
    }
    default:
      break;
  }
  return selection;
};

export const GeneralTransforms = {
  /**
   * Transform the editor by an operation.
   */

  transform(root, op) {
    root.children = createDraft(root.children);
    let selection = null; // editor.selection && createDraft(editor.selection);

    try {
      /* selection =  */ applyToDraft(root, selection, op);
    } finally {
      root.children = finishDraft(root.children);

      // if (selection) {
      //   editor.selection = isDraft(selection)
      //     ? finishDraft(selection)
      //     : selection;
      // } else {
      // editor.selection = null;
      // }
    }
  },
};

const DIRTY_PATHS = new WeakMap();

const FLUSHING = new WeakMap();

export const apply = (editor, root, op) => {
  for (const ref of pathRefs(root)) {
    PathRef.transform(ref, op);
  }

  for (const ref of pointRefs(root)) {
    PointRef.transform(ref, op);
  }

  for (const ref of rangeRefs(root)) {
    RangeRef.transform(ref, op);
  }

  const set = new Set();
  const dirtyPaths = [];

  const add = (path) => {
    if (path) {
      const key = path.join(',');

      if (!set.has(key)) {
        set.add(key);
        dirtyPaths.push(path);
      }
    }
  };

  const oldDirtyPaths = DIRTY_PATHS.get(root) || [];
  const newDirtyPaths = getDirtyPaths(op);

  for (const path of oldDirtyPaths) {
    const newPath = Path.transform(path, op);
    add(newPath);
  }

  for (const path of newDirtyPaths) {
    add(path);
  }

  DIRTY_PATHS.set(root, dirtyPaths);
  GeneralTransforms.transform(root, op);

  root.children = normalizeNodes(editor, root.children);

  // editor.operations.push(op);
  // Editor.normalize(editor);

  // Clear any formats applied to the cursor if the selection changes.
  // if (op.type === 'set_selection') {
  //   editor.marks = null;
  // }

  if (!FLUSHING.get(root)) {
    FLUSHING.set(root, true);

    Promise.resolve().then(() => {
      FLUSHING.set(root, false);

      // TODO: these 2 lines should be replaced with something that applies the
      // operations in the operation queue if I test this and it does not work
      // well... but why is the normalization done so much above this point?
      editor.onChange();
      editor.operations = [];
    });
  }
};

/**
 * Move the nodes at a location to a new location.
 */
export const moveNodes = (editor, root, options) => {
  const { to, at = null, mode = 'lowest', voids = false } = options;
  let { match } = options;

  if (!at) {
    return;
  }

  if (match == null) {
    match = Path.isPath(at)
      ? matchPath(root, at)
      : (n) => Editor.isBlock(editor, n);
  }

  const toRef = pathRef(root, to);
  const targets = nodes(editor, root, { at, match, mode, voids });
  const pathRefs = Array.from(targets, ([, p]) => pathRef(root, p));

  for (const pathRef of pathRefs) {
    const path = pathRef.unref();
    const newPath = toRef.current;

    if (path.length !== 0) {
      // TODO:
      editor.apply({ type: 'move_node', path, newPath });
    }

    if (
      toRef.current &&
      Path.isSibling(newPath, path) &&
      Path.isAfter(newPath, path)
    ) {
      // When performing a sibling move to a later index, the path at the destination is shifted
      // to before the insertion point instead of after. To ensure our group of nodes are inserted
      // in the correct order we increment toRef to account for that
      toRef.current = Path.next(toRef.current);
    }
  }

  toRef.unref();
};

/**
 * Remove the nodes at a specific location in the document.
 */
export const removeNodes = (editor, root, options = {}) => {
  const { hanging = false, voids = false, mode = 'lowest' } = options;
  let { at = null, match } = options;

  if (!at) {
    return;
  }

  if (match == null) {
    match = Path.isPath(at)
      ? matchPath(root, at)
      : (n) => Editor.isBlock(editor, n);
  }

  if (!hanging && Range.isRange(at)) {
    at = unhangRange(editor, root, at);
  }

  const depths = nodes(editor, root, { at, match, mode, voids });
  const pathRefs = Array.from(depths, ([, p]) => pathRef(root, p));

  for (const pathRef of pathRefs) {
    const path = pathRef.unref();

    if (path) {
      const [_node] = node(root, path);
      editor.apply({ type: 'remove_node', path, node: _node });
    }
  }
};

/**
 * Merge a node at a location with the previous node of the same depth,
 * removing any empty containing nodes after the merge if necessary.
 */
export const mergeNodes = (editor, root, options = {}) => {
  let { match, at = null } = options;
  const { hanging = false, voids = false, mode = 'lowest' } = options;

  if (!at) {
    return;
  }

  if (match == null) {
    if (Path.isPath(at)) {
      const [_parent] = parent(root, at);
      match = (n) => _parent.children.includes(n);
    } else {
      match = (n) => Editor.isBlock(editor, n);
    }
  }

  if (!hanging && Range.isRange(at)) {
    at = unhangRange(editor, root, at);
  }

  if (Range.isRange(at)) {
    if (Range.isCollapsed(at)) {
      at = at.anchor;
    } else {
      // const [, end] = Range.edges(at)
      // const pointRef = Editor.pointRef(editor, end)
      Transforms.delete(editor, { at });
      // at = pointRef.unref();

      // if (options.at == null) {
      // Transforms.select(editor, at)
      // }
    }
  }

  const [current] = nodes(editor, root, { at, match, voids, mode });
  const prev = previous(editor, root, { at, match, voids, mode });

  if (!current || !prev) {
    return;
  }

  const [node, path] = current;
  const [prevNode, prevPath] = prev;

  if (path.length === 0 || prevPath.length === 0) {
    return;
  }

  const newPath = Path.next(prevPath);
  const commonPath = Path.common(path, prevPath);
  const isPreviousSibling = Path.isSibling(path, prevPath);
  const _levels = Array.from(levels(editor, root, { at: path }), ([n]) => n)
    .slice(commonPath.length)
    .slice(0, -1);

  // Determine if the merge will leave an ancestor of the path empty as a
  // result, in which case we'll want to remove it after merging.
  const emptyAncestor = above(editor, root, {
    at: path,
    mode: 'highest',
    match: (n) => _levels.includes(n) && hasSingleChildNest(editor, n),
  });

  const emptyRef = emptyAncestor && Editor.pathRef(editor, emptyAncestor[1]);
  let properties;
  let position;

  // Ensure that the nodes are equivalent, and figure out what the position
  // and extra properties of the merge will be.
  if (Text.isText(node) && Text.isText(prevNode)) {
    const { text, ...rest } = node;
    position = prevNode.text.length;
    properties = rest;
  } else if (Element.isElement(node) && Element.isElement(prevNode)) {
    const { children, ...rest } = node;
    position = prevNode.children.length;
    properties = rest;
  } else {
    throw new Error(
      `Cannot merge the node at path [${path}] with the previous sibling because it is not the same kind: ${JSON.stringify(
        node,
      )} ${JSON.stringify(prevNode)}`,
    );
  }

  // If the node isn't already the next sibling of the previous node, move
  // it so that it is before merging.
  if (!isPreviousSibling) {
    moveNodes(editor, { at: path, to: newPath, voids });
  }

  // If there was going to be an empty ancestor of the node that was merged,
  // we remove it from the tree.
  if (emptyRef) {
    Transforms.removeNodes(editor, { at: emptyRef.current, voids });
  }

  // If the target node that we're merging with is empty, remove it instead
  // of merging the two. This is a common rich text editor behavior to
  // prevent losing formatting when deleting entire nodes when you have a
  // hanging selection.
  // if prevNode is first child in parent,don't remove it.
  if (
    (Element.isElement(prevNode) && Editor.isEmpty(editor, prevNode)) ||
    (Text.isText(prevNode) &&
      prevNode.text === '' &&
      prevPath[prevPath.length - 1] !== 0)
  ) {
    removeNodes(editor, { at: prevPath, voids });
  } else {
    apply({
      type: 'merge_node',
      path: newPath,
      position,
      properties,
    });
  }

  if (emptyRef) {
    emptyRef.unref();
  }
};

/**
 * Create a mutable ref for a `Point` object, which will stay in sync as new
 * operations are applied to the editor.
 */
export const pointRef = (editor, root, point, options = {}) => {
  const { affinity = 'forward' } = options;
  const ref = {
    current: point,
    affinity,
    unref() {
      const { current } = ref;
      const _pointRefs = pointRefs(root);
      _pointRefs.delete(ref);
      ref.current = null;
      return current;
    },
  };

  const refs = pointRefs(root);
  refs.add(ref);
  return ref;
};

/**
 * Match a void node in the current branch of the editor.
 * Copied from Editor.void in Slate.js.
 */

export const voidNode = (editor, root, options = {}) => {
  return above(editor, root, {
    ...options,
    match: (n) => Editor.isVoid(editor, n),
  });
};

/**
 * Get the point after a location.
 */
export const after = (editor, root, at, options = {}) => {
  const anchor = point(root, at, { edge: 'end' });
  const focus = end(root, []);
  const range = { anchor, focus };
  const { distance = 1 } = options;
  let d = 0;
  let target;

  for (const p of positions(editor, root, {
    ...options,
    at: range,
  })) {
    if (d > distance) {
      break;
    }

    if (d !== 0) {
      target = p;
    }

    d++;
  }

  return target;
};

/**
 * Get the leaf text node at a location.
 */
export const leaf = (editor, root, at, options = {}) => {
  const _path = path(root, at, options);
  const node = Node.leaf(root, _path);
  return [node, _path];
};

/**
 * Delete content in the editor.
 * Taken from Transforms.delete method from Slate.js and changed to work on data external to the editor.
 */
export const deleteText = (editor, root, options = {}) => {
  const {
    reverse = false,
    unit = 'character',
    distance = 1,
    voids = false,
  } = options;
  let { at = null, hanging = false } = options;

  if (!at) {
    return;
  }

  if (Range.isRange(at) && Range.isCollapsed(at)) {
    at = at.anchor;
  }

  if (Point.isPoint(at)) {
    const furthestVoid = voidNode(editor, root, { at, mode: 'highest' });

    if (!voids && furthestVoid) {
      const [, voidPath] = furthestVoid;
      at = voidPath;
    } else {
      const opts = { unit, distance };
      const target = reverse
        ? before(editor, root, at, opts) || start(root, [])
        : after(editor, root, at, opts) || end(root, []);
      at = { anchor: at, focus: target };
      hanging = true;
    }
  }

  if (Path.isPath(at)) {
    removeNodes(editor, root, { at, voids });
    return;
  }

  if (Range.isCollapsed(at)) {
    return;
  }

  if (!hanging) {
    const [, end] = Range.edges(at);
    const endOfDoc = end(root, []);

    if (!Point.equals(end, endOfDoc)) {
      at = unhangRange(editor, root, at, { voids });
    }
  }

  let [_start, _end] = Range.edges(at);
  const startBlock = above(editor, root, {
    match: (n) => Editor.isBlock(editor, n),
    at: _start,
    voids,
  });
  const endBlock = above(editor, root, {
    match: (n) => Editor.isBlock(editor, n),
    at: _end,
    voids,
  });
  const isAcrossBlocks =
    startBlock && endBlock && !Path.equals(startBlock[1], endBlock[1]);
  const isSingleText = Path.equals(_start.path, _end.path);
  const startVoid = voids
    ? null
    : voidNode(editor, root, { at: _start, mode: 'highest' });
  const endVoid = voids
    ? null
    : voidNode(editor, root, { at: _end, mode: 'highest' });

  // If the start or end points are inside an inline void, nudge them out.
  if (startVoid) {
    const _before = before(editor, root, _start);

    if (_before && startBlock && Path.isAncestor(startBlock[1], _before.path)) {
      _start = _before;
    }
  }

  if (endVoid) {
    const _after = after(editor, root, _end);

    if (_after && endBlock && Path.isAncestor(endBlock[1], _after.path)) {
      _end = _after;
    }
  }

  // Get the highest nodes that are completely inside the range, as well as
  // the start and end nodes.
  const matches = [];
  let lastPath;

  for (const entry of nodes(editor, root, { at, voids })) {
    const [node, path] = entry;

    if (lastPath && Path.compare(path, lastPath) === 0) {
      continue;
    }

    if (
      (!voids && Editor.isVoid(editor, node)) ||
      (!Path.isCommon(path, _start.path) && !Path.isCommon(path, _end.path))
    ) {
      matches.push(entry);
      lastPath = path;
    }
  }

  const pathRefs = Array.from(matches, ([, p]) => pathRef(root, p));
  const startRef = pointRef(editor, root, _start);
  const endRef = pointRef(editor, root, _end);

  if (!isSingleText && !startVoid) {
    const point = startRef.current;
    const [node] = leaf(editor, root, point);
    const { path } = point;
    const { offset } = _start;
    const text = node.text.slice(offset);
    if (text.length > 0)
      apply(editor, root, { type: 'remove_text', path, offset, text });
  }

  for (const pathRef of pathRefs) {
    const path = pathRef.unref();
    removeNodes(editor, root, { at: path, voids });
  }

  if (!endVoid) {
    const point = endRef.current;
    const [node] = leaf(editor, root, point);
    const { path } = point;
    const offset = isSingleText ? _start.offset : 0;
    const text = node.text.slice(offset, _end.offset);
    if (text.length > 0)
      editor.apply(editor, root, { type: 'remove_text', path, offset, text });
  }

  if (!isSingleText && isAcrossBlocks && endRef.current && startRef.current) {
    mergeNodes(editor, root, {
      at: endRef.current,
      hanging: true,
      voids,
    });
  }

  /* const point = */ reverse
    ? startRef.unref() || endRef.unref()
    : endRef.unref() || startRef.unref();

  // if (options.at == null && point) {
  //   Transforms.select(editor, point);
  // }
};

/**
 * Check if a point is the end point of a location.
 */
export const isEnd = (root, point, at) => {
  const _end = end(root, at);
  return Point.equals(point, _end);
};

/**
 * Convert a range into a point by deleting it's content.
 */
const deleteRange = (editor, root, range) => {
  if (Range.isCollapsed(range)) {
    return range.anchor;
  } else {
    const [, _end] = Range.edges(range);
    const _pointRef = pointRef(root, _end);
    deleteText(editor, root, { at: range });
    return _pointRef.unref();
  }
};

/**
 * Check if a point is the start point of a location.
 */
const isStart = (root, point, at) => {
  // PERF: If the offset isn't `0` we know it's not the start.
  if (point.offset !== 0) {
    return false;
  }

  const _start = start(root, at);
  return Point.equals(point, _start);
};

/**
 * Check if a point is an edge of a location.
 */
const isEdge = (root, point, at) => {
  return isStart(root, point, at) || isEnd(root, point, at);
};

/**
 * Split the nodes at a specific location.
 */
export const splitNodes = (editor, root, options = {}) => {
  const { mode = 'lowest', voids = false } = options;
  let { match, at = null, height = 0, always = false } = options;

  if (match == null) {
    match = (n) => Editor.isBlock(editor, n);
  }

  if (Range.isRange(at)) {
    at = deleteRange(editor, root, at);
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

  const beforeRef = pointRef(editor, root, at, {
    affinity: 'backward',
  });
  const [highest] = nodes(editor, root, { at, match, mode, voids });

  if (!highest) {
    return;
  }

  const voidMatch = voidNode(editor, root, { at, mode: 'highest' });
  const nudge = 0;

  if (!voids && voidMatch) {
    const [_voidNode, voidPath] = voidMatch;

    if (Element.isElement(_voidNode) && editor.isInline(_voidNode)) {
      let _after = after(editor, root, voidPath);

      if (!_after) {
        const text = { text: '' };
        const afterPath = Path.next(voidPath);
        insertNodes(editor, root, text, { at: afterPath, voids });
        _after = point(root, afterPath);
      }

      at = _after;
      always = true;
    }

    const siblingHeight = at.path.length - voidPath.length;
    height = siblingHeight + 1;
    always = true;
  }

  const afterRef = pointRef(editor, root, at);
  const depth = at.path.length - height;
  const [, highestPath] = highest;
  const lowestPath = at.path.slice(0, depth);
  let position = height === 0 ? at.offset : at.path[depth] + nudge;

  for (const [node, path] of levels(editor, root, {
    at: lowestPath,
    reverse: true,
    voids,
  })) {
    let split = false;

    if (
      path.length < highestPath.length ||
      path.length === 0 ||
      (!voids && Editor.isVoid(editor, node))
    ) {
      break;
    }

    const point = beforeRef.current;
    const _isEnd = isEnd(root, point, path);

    if (always || !beforeRef || !isEdge(root, point, path)) {
      split = true;
      const properties = Node.extractProps(node);
      editor.apply({
        type: 'split_node',
        path,
        position,
        properties,
      });
    }

    position = path[path.length - 1] + (split || _isEnd ? 1 : 0);
  }

  // if (options.at == null) {
  // const point = afterRef.current || Editor.end(editor, []);
  // Transforms.select(editor, point);
  // }

  beforeRef.unref();
  afterRef.unref();
};

/**
 * Insert nodes at a specific location in the Editor.
 */
export const insertNodes = (editor, root, _nodes, options = {}) => {
  const { /* hanging = false, */ voids = false, mode = 'lowest' } = options;
  let { at, match /* , select */ } = options;

  if (Node.isNode(_nodes)) {
    _nodes = [_nodes];
  }

  if (_nodes.length === 0) {
    return;
  }

  const [node] = _nodes;

  // By default, use the selection as the target location. But if there is
  // no selection, insert at the end of the document since that is such a
  // common use case when inserting from a non-selected state.
  if (!at) {
    // if (editor.selection) {
    // at = editor.selection;
    /* } else */ if (root.children.length > 0) {
      at = end(root, []);
    } else {
      at = [0];
    }

    // select = true;
  }

  // if (select == null) {
  //   select = false;
  // }

  // if (Range.isRange(at)) {
  //   if (!hanging) {
  //     at = unhangRange(editor, root, at);
  //   }

  //   if (Range.isCollapsed(at)) {
  //     at = at.anchor;
  //   } else {
  //     const [, end] = Range.edges(at);
  //     const _pointRef = pointRef(editor, root, end);
  //     deleteText(editor, root, { at });
  //     at = _pointRef.unref();
  //   }
  // }

  if (Point.isPoint(at)) {
    if (match == null) {
      if (Text.isText(node)) {
        match = (n) => Text.isText(n);
      } else if (editor.isInline(node)) {
        match = (n) => Text.isText(n) || Editor.isInline(editor, n);
      } else {
        match = (n) => Editor.isBlock(editor, n);
      }
    }

    const [entry] = nodes(editor, root, {
      at: at.path,
      match,
      mode,
      voids,
    });

    if (entry) {
      const [, matchPath] = entry;
      const _pathRef = pathRef(root, matchPath);
      const isAtEnd = isEnd(root, at, matchPath);
      splitNodes(editor, { at, match, mode, voids });
      const path = _pathRef.unref();
      at = isAtEnd ? Path.next(path) : path;
    } else {
      return;
    }
  }

  const parentPath = Path.parent(at);
  let index = at[at.length - 1];

  if (!voids && voidNode(editor, root, { at: parentPath })) {
    return;
  }

  for (const node of _nodes) {
    const path = parentPath.concat(index);
    index++;
    editor.apply(editor, root, { type: 'insert_node', path, node });
    // at = Path.next(at);
  }
  // at = Path.previous(at);

  // if (select) {
  // const point = end(root, at);

  // if (point) {
  //   Transforms.select(editor, point);
  // }
  // }
};

export const normalizeNode = (editor, root, entry) => {
  const [node, path] = entry;

  // There are no core normalizations for text nodes.
  if (Text.isText(node)) {
    return;
  }

  // Ensure that block and inline nodes have at least one text child.
  if (Element.isElement(node) && node.children.length === 0) {
    const child = { text: '' };
    insertNodes(editor, root, child, {
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
        Text.isText(node.children[0]) ||
        editor.isInline(node.children[0]));

  // Since we'll be applying operations while iterating, keep track of an
  // index that accounts for any added/removed nodes.
  let n = 0;

  for (let i = 0; i < node.children.length; i++, n++) {
    const currentNode = Node.get(root, path);
    if (Text.isText(currentNode)) {
      continue;
    }
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
      removeNodes(editor, root, { at: path.concat(n), voids: true });
      --n;
    } else if (Element.isElement(child)) {
      // Ensure that inline nodes are surrounded by text nodes.
      if (editor.isInline(child)) {
        if (prev == null || !Text.isText(prev)) {
          const newChild = { text: '' };
          insertNodes(editor, root, newChild, {
            at: path.concat(n),
            voids: true,
          });
          n++;
        } else if (isLast) {
          const newChild = { text: '' };
          insertNodes(editor, root, newChild, {
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
          mergeNodes(editor, root, { at: path.concat(n), voids: true });
          n--;
        } else if (prev.text === '') {
          removeNodes(editor, root, {
            at: path.concat(n - 1),
            voids: true,
          });
          n--;
        } else if (child.text === '') {
          removeNodes(editor, root, {
            at: path.concat(n),
            voids: true,
          });
          n--;
        }
      }
    }
  }
};

/**
 * Normalize any dirty objects in the editor.
 */
export const normalizeNodes = (editor, nodes) => {
  // return nodes;

  // debugger;

  console.log('BEFORE', JSON.stringify(nodes, null, 2));

  const root = { children: nodes };

  const n = Array.from(Node.nodes(root), ([, p]) => p);

  const max = n.length * 42; // HACK: better way?
  let m = 0;

  while (n.length !== 0) {
    if (m > max) {
      throw new Error(
        `Could not completely normalize the Slate tree after ${max} iterations! This is usually due to incorrect normalization logic that leaves a node in an invalid state.`,
      );
    }

    const dirtyPath = n.pop();

    const entry = Node.get(root, dirtyPath);
    normalizeNode(editor, root, [entry, dirtyPath]);

    ++m;
  }

  console.log('AFTER', JSON.stringify(nodes, null, 2));

  return nodes;
};
