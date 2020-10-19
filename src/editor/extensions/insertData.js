import { Editor, Text, Transforms } from 'slate';
import { deserialize } from 'volto-slate/editor/deserialize';
import { createDefaultBlock, normalizeBlockNodes } from 'volto-slate/utils';

import { Path, Range, Node, Element } from 'slate';

const customInsertNodes = (editor, nodes) => {
  Editor.withoutNormalizing(editor, () => {
    let at = editor.selection;
    const voids = false;

    Editor.unhangRange(editor, at);

    if (Range.isCollapsed(at)) {
      at = at.anchor;
    } else {
      var [, end] = Range.edges(at);
      var pointRef = Editor.pointRef(editor, end);
      Transforms.delete(editor, {
        at,
      });
      at = pointRef.unref();
    }

    // If the insert point is at the edge of an inline node, move it outside
    // instead since it will need to be split otherwise.
    var inlineElementMatch = Editor.above(editor, {
      at,
      match: (n) => Editor.isInline(editor, n),
      mode: 'highest',
      voids,
    });

    if (inlineElementMatch) {
      var [, _inlinePath] = inlineElementMatch;

      if (Editor.isEnd(editor, at, _inlinePath)) {
        var after = Editor.after(editor, _inlinePath);
        at = after;
      } else if (Editor.isStart(editor, at, _inlinePath)) {
        var before = Editor.before(editor, _inlinePath);
        at = before;
      }
    }

    var blockMatch = Editor.above(editor, {
      match: (n) => Editor.isBlock(editor, n),
      at,
      voids,
    });
    var [, blockPath] = blockMatch;
    var isBlockStart = Editor.isStart(editor, at, blockPath);
    var isBlockEnd = Editor.isEnd(editor, at, blockPath);
    var mergeStart = !isBlockStart || (isBlockStart && isBlockEnd);
    var mergeEnd = !isBlockEnd;
    var [, firstPath] = Node.first(
      {
        children: nodes,
      },
      [],
    );
    var [, lastPath] = Node.last(
      {
        children: nodes,
      },
      [],
    );
    var matches = [];

    var matcher = (_ref2) => {
      var [n, p] = _ref2;

      if (
        mergeStart &&
        Path.isAncestor(p, firstPath) &&
        Element.isElement(n) &&
        !editor.isVoid(n) &&
        !editor.isInline(n)
      ) {
        return false;
      }

      if (
        mergeEnd &&
        Path.isAncestor(p, lastPath) &&
        Element.isElement(n) &&
        !editor.isVoid(n) &&
        !editor.isInline(n)
      ) {
        return false;
      }

      return true;
    };

    for (var entry of Node.nodes(
      {
        children: nodes,
      },
      {
        pass: matcher,
      },
    )) {
      if (entry[1].length > 0 && matcher(entry)) {
        matches.push(entry);
      }
    }

    var starts = [];
    var middles = [];
    var ends = [];
    var starting = true;
    var hasBlocks = false;

    for (var [node] of matches) {
      if (Element.isElement(node) && !editor.isInline(node)) {
        starting = false;
        hasBlocks = true;
        middles.push(node);
      } else if (starting) {
        starts.push(node);
      } else {
        ends.push(node);
      }
    }

    var [inlineMatch] = Editor.nodes(editor, {
      at,
      match: (n) => Text.isText(n) || Editor.isInline(editor, n),
      mode: 'highest',
      voids,
    });
    var [, inlinePath] = inlineMatch;
    var isInlineStart = Editor.isStart(editor, at, inlinePath);
    var isInlineEnd = Editor.isEnd(editor, at, inlinePath);
    var middleRef = Editor.pathRef(
      editor,
      isBlockEnd ? Path.next(blockPath) : blockPath,
    );
    var endRef = Editor.pathRef(
      editor,
      isInlineEnd ? Path.next(inlinePath) : inlinePath,
    );
    Transforms.splitNodes(editor, {
      at,
      match: (n) =>
        hasBlocks
          ? Editor.isBlock(editor, n)
          : Text.isText(n) || Editor.isInline(editor, n),
      mode: hasBlocks ? 'lowest' : 'highest',
      voids,
    });
    var startRef = Editor.pathRef(
      editor,
      !isInlineStart || (isInlineStart && isInlineEnd)
        ? Path.next(inlinePath)
        : inlinePath,
    );
    Transforms.insertNodes(editor, starts, {
      at: startRef.current,
      match: (n) => Text.isText(n) || Editor.isInline(editor, n),
      mode: 'highest',
      voids,
    });
    Transforms.insertNodes(editor, middles, {
      at: middleRef.current,
      match: (n) => Editor.isBlock(editor, n),
      mode: 'lowest',
      voids,
    });
    Transforms.insertNodes(editor, ends, {
      at: endRef.current,
      match: (n) => Text.isText(n) || Editor.isInline(editor, n),
      mode: 'highest',
      voids,
    });

    var path;

    if (ends.length > 0) {
      path = Path.previous(endRef.current);
    } else if (middles.length > 0) {
      path = Path.previous(middleRef.current);
    } else {
      path = Path.previous(startRef.current);
    }

    var _end = Editor.end(editor, path);

    Transforms.select(editor, _end);

    startRef.unref();
    middleRef.unref();
    endRef.unref();
  });
};

export const insertData = (editor) => {
  // const { insertData } = editor;

  editor.insertData = (data) => {
    // console.log('data in custom editor.insertData', data);
    // TODO: use the rtf data to get the embedded images.
    // const text = data.getData('text/rtf');
    // console.log('text', text);

    let fragment;

    fragment = data.getData('application/x-slate-fragment');

    if (fragment) {
      const decoded = decodeURIComponent(window.atob(fragment));
      const parsed = JSON.parse(decoded);
      editor.insertFragment(parsed);
      return;
    }

    const html = data.getData('text/html');
    // TODO: Avoid responding to drag/drop and others
    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');

      const body =
        parsed.getElementsByTagName('google-sheets-html-origin').length > 0
          ? parsed.querySelector('google-sheets-html-origin > table')
          : parsed.body;

      console.log('deserialize body', body);
      console.log('parsed body', parsed);

      fragment = deserialize(editor, body);
    } else {
      const text = data.getData('text/plain');
      if (!text) return;
      const paras = text.split('\n');
      fragment = paras.map((p) => createDefaultBlock([{ text: p }]));
      // return insertData(data);
    }

    // When there's already text in the editor, insert a fragment, not nodes
    if (Editor.string(editor, [])) {
      if (
        Array.isArray(fragment) &&
        fragment.findIndex((b) => Editor.isInline(b) || Text.isText(b)) > -1
      ) {
        console.log('insert fragment', fragment);
        // TODO: we want normalization also when dealing with fragments
        Transforms.insertFragment(editor, fragment);
        return;
      }
    }

    console.log('fragment', fragment);
    const nodes = normalizeBlockNodes(editor, fragment);
    console.log('insert nodes', nodes);
    // Transforms.insertNodes(editor, nodes);
    customInsertNodes(editor, nodes);

    // TODO: This used to solve a problem when pasting images. What is it?
    // Transforms.deselect(editor);
  };

  return editor;
};

//   // Delete the empty placeholder paragraph, if we can
//   // Transforms.deselect(editor);
//   Transforms.removeNodes(editor);
//   // Wrap the text nodes of the fragment in paragraphs
//   // fragment = Array.isArray(fragment)
//   //   ? fragment.map((b) =>
//   //       Editor.isInline(b) || Text.isText(b) ? createBlock(b) : b,
//   //     )
//   //   : fragment;
//   // console.log('Pasting in empty block:', fragment);
