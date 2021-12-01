import { Editor, Transforms, Node, Text } from 'slate'; // Range,

/**
 * @description Creates or updates an existing $elementType. It also takes care
 * of the saved selection and uses PathRef.
 *
 * @param {Editor} editor The Slate editor for the context
 * @param {object} data Relevant data for this element
 *
 * @returns {boolean} true if an element was possibly inserted, false otherwise
 * (currently we do not check here if the element was already applied to the
 * editor)
 */
export const _insertElement = (elementType) => (editor, data) => {
  if (editor.getSavedSelection()) {
    const selection = editor.selection || editor.getSavedSelection();

    const rangeRef = Editor.rangeRef(editor, selection);

    const res = Array.from(
      Editor.nodes(editor, {
        match: (n) => n.type === elementType,
        mode: 'highest',
        at: selection,
      }),
    );

    if (res.length) {
      const [, path] = res[0];
      Transforms.setNodes(
        editor,
        { data },
        {
          at: path ? path : null,
          match: path ? (n) => n.type === elementType : null,
        },
      );
    } else {
      Transforms.wrapNodes(
        editor,
        { type: elementType, data },
        {
          split: true,
          at: selection,
          match: (node) => {
            return Node.string(node).length !== 0;
          },
        }, //,
      );
    }

    const sel = JSON.parse(JSON.stringify(rangeRef.current));
    Transforms.select(editor, sel);
    editor.setSavedSelection(sel);

    return true;
  }

  return false;
};

/**
 * Will unwrap a node that has as type the one received or one from an array
 * @param {string|Object[]} elementType - this can be a string or an array of strings
 * @returns {Object|null} - current node
 */
export const _unwrapElement = (elementType) => (editor) => {
  const selection = editor.selection || editor.getSavedSelection();
  const ref = Editor.rangeRef(editor, selection);

  Transforms.select(editor, selection);
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      Array.isArray(elementType)
        ? elementType.includes(n.type)
        : n.type === elementType,
    at: selection,
  });

  const current = ref.current;
  ref.unref();

  return current;
};

/**
 * Will clear formatting of the selection.
 */
export const _clearFormatting = () => (editor) => {
  const selection = editor.selection || editor.getSavedSelection();
  const ref = Editor.rangeRef(editor, selection);

  Transforms.select(editor, selection);

  const s = Editor.string(editor, selection);
  Editor.withoutNormalizing(editor, () => {
    Transforms.splitNodes(editor, {
      match: (n) => Text.isText(n),
      at: ref.current.anchor,
      // match: (n) => Editor.isBlock(editor, n),
      always: true,
      // mode: 'lowest',
      height: 0,
    });

    Transforms.splitNodes(editor, {
      match: (n) => Text.isText(n),
      at: ref.current.focus,
      // match: (n) => Editor.isBlock(editor, n),
      always: true,
      // mode: 'lowest',
      height: 0,
    });

    Transforms.delete(editor, ref.current);

    const pt = Editor.point(editor, ref.current, { edge: 'start' });

    Transforms.liftNodes(editor, {
      at: pt,
      match: (n) => Text.isText(n),
    });

    // const pt2 = Editor.point(editor, ref.current, { edge: 'start' });

    Editor.insertText(editor, s);

    // NOTE: this would work perfectly but it does not set text propery on Text objects
    // Transforms.setNodes(editor, { text: s }, { at: pt2.path });

    // Transforms.insertNodes(editor, { text: s });
  });

  const current = ref.current;

  Transforms.select(editor, current);

  ref.unref();

  return current;
};

export const _isActiveElement = (elementType) => (editor) => {
  const selection = editor.selection || editor.getSavedSelection();
  let found;
  try {
    found = Array.from(
      Editor.nodes(editor, {
        match: (n) => n.type === elementType,
        at: selection,
      }) || [],
    );
  } catch (e) {
    // eslint-disable-next-line
    // console.warn('Error in finding active element', e);
    return false;
  }
  if (found.length) return true;

  if (selection) {
    const { path } = selection.anchor;
    const isAtStart =
      selection.anchor.offset === 0 && selection.focus.offset === 0;

    if (isAtStart) {
      try {
        found = Editor.previous(editor, {
          at: path,
          // match: (n) => n.type === MENTION,
        });
      } catch (ex) {
        found = [];
      }
      if (found && found[0] && found[0].type === elementType) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Will look for a node that has as type the one received or one from an array
 * @param {string|Object[]} elementType - this can be a string or an array of strings
 * @returns {Object|null} - found node
 */
export const _getActiveElement = (elementType) => (
  editor,
  direction = 'any',
) => {
  const selection = editor.selection || editor.getSavedSelection();
  let found = [];

  try {
    found = Array.from(
      Editor.nodes(editor, {
        match: (n) =>
          Array.isArray(elementType)
            ? elementType.includes(n.type)
            : n.type === elementType,
        at: selection,
      }),
    );
  } catch (e) {
    return null;
  }

  if (found.length) return found[0];

  if (!selection) return null;

  if (direction === 'any' || direction === 'backward') {
    const { path } = selection.anchor;
    const isAtStart =
      selection.anchor.offset === 0 && selection.focus.offset === 0;

    if (isAtStart) {
      let found;
      try {
        found = Editor.previous(editor, {
          at: path,
        });
      } catch (ex) {
        // eslint-disable-next-line no-console
        console.warn('Unable to find previous node', editor, path);
        return;
      }
      if (found && found[0] && found[0].type === elementType) {
        if (
          (Array.isArray(elementType) && elementType.includes(found[0].type)) ||
          found[0].type === elementType
        ) {
          return found;
        }
      } else {
        return null;
      }
    }
  }

  if (direction === 'any' || direction === 'forward') {
    const { path } = selection.anchor;
    const isAtStart =
      selection.anchor.offset === 0 && selection.focus.offset === 0;

    if (isAtStart) {
      let found;
      try {
        found = Editor.next(editor, {
          at: path,
        });
      } catch (e) {
        // eslint-disable-next-line
        console.warn('Unable to find next node', editor, path);
        return;
      }
      if (found && found[0] && found[0].type === elementType) {
        if (
          (Array.isArray(elementType) && elementType.includes(found[0].type)) ||
          found[0].type === elementType
        ) {
          return found;
        }
      } else {
        return null;
      }
    }
  }

  return null;
};
