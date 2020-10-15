import { Editor, Transforms } from 'slate'; // Range,

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
  // console.log('insert', data);
  if (editor.getSavedSelection()) {
    const selection = editor.selection || editor.getSavedSelection();

    const rangeRef = Editor.rangeRef(editor, selection);
    // console.log('sel', selection, JSON.stringify(editor.selection));

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
        { split: true, at: selection }, //,
      );
    }

    const sel = JSON.parse(JSON.stringify(rangeRef.current));
    Transforms.select(editor, sel);
    editor.setSavedSelection(sel);

    return true;
  }

  return false;
};

export const _unwrapElement = (elementType) => (editor) => {
  const selection = editor.selection || editor.getSavedSelection();
  Transforms.select(editor, selection);
  Transforms.unwrapNodes(editor, {
    match: (n) => n.type === elementType,
    at: selection,
  });
};

export const _isActiveElement = (elementType) => (editor) => {
  const selection = editor.selection || editor.getSavedSelection();
  let found = Array.from(
    Editor.nodes(editor, {
      match: (n) => n.type === elementType,
      at: selection,
    }) || [],
  );
  if (found.length) return true;

  if (selection) {
    const { path } = selection.anchor;
    const isAtStart =
      selection.anchor.offset === 0 && selection.focus.offset === 0;

    if (isAtStart) {
      found = Array.from(
        Editor.previous(editor, {
          at: path,
          // match: (n) => n.type === MENTION,
        }) || [],
      );
      if (found && found[0] && found[0].type === elementType) {
        return true;
      }
    }
  }

  return false;
};

export const _getActiveElement = (elementType) => (
  editor,
  direction = 'any',
) => {
  const selection = editor.selection || editor.getSavedSelection();
  let found = Array.from(
    Editor.nodes(editor, {
      match: (n) => n.type === elementType,
      at: selection,
    }),
  );
  if (found.length) return found[0];

  if (!selection) return false;

  if (direction === 'any' || direction === 'backward') {
    const { path } = selection.anchor;
    const isAtStart =
      selection.anchor.offset === 0 && selection.focus.offset === 0;

    if (isAtStart) {
      let found = Editor.previous(editor, {
        at: path,
      });
      if (found && found[0].type === elementType) {
        return found;
      }
    }
  }

  if (direction === 'any' || direction === 'forward') {
    const { path } = selection.anchor;
    const isAtStart =
      selection.anchor.offset === 0 && selection.focus.offset === 0;

    if (isAtStart) {
      let found = Editor.next(editor, {
        at: path,
      });
      if (found && found[0].type === elementType) {
        return found;
      }
    }
  }
};
