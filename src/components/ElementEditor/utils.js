import { Editor, Transforms } from 'slate'; // Range,

/**
 * @description Creates or updates an existing $elementType. It also takes care
 * of the saved selection and uses PathRef.
 *
 * @param {Editor} editor The Slate editor for the context
 * @param {object} data Relevant data for this element
 */
export const _insertElement = (elementType) => (editor, data) => {
  if (editor.savedSelection) {
    const selection = editor.savedSelection;

    const rangeRef = Editor.rangeRef(editor, selection);

    // console.log(
    //   'insert',
    //   JSON.stringify(selection),
    //   JSON.stringify(rangeRef.current),
    // );

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
      // Transforms.collapse(editor, { edge: 'end' });
    } else {
      Transforms.wrapNodes(
        editor,
        { type: elementType, data },
        { split: true, at: selection }, //,
      );
    }

    // console.log('new selection', JSON.parse(JSON.stringify(rangeRef.current)));
    Transforms.select(editor, JSON.parse(JSON.stringify(rangeRef.current)));
    editor.savedSelection = JSON.parse(JSON.stringify(rangeRef.current));
    // if (data) {
    // If there's data, the footnote has been edited, otherwise it's a new footnote and we want to edit it
    // Transforms.collapse(editor); // TODO; collapse to original offset
    // }
  }
};

export const _unwrapElement = (elementType) => (editor) => {
  const selection = editor.selection || editor.savedSelection;
  Transforms.select(editor, selection);
  Transforms.unwrapNodes(editor, {
    match: (n) => n.type === elementType,
    at: selection,
  });
};

export const _isActiveElement = (elementType) => (editor) => {
  const selection = editor.selection || editor.savedSelection;
  const [note] = Editor.nodes(editor, {
    match: (n) => n.type === elementType,
    at: selection,
  });

  return !!note;
};

export const _getActiveElement = (elementType) => (editor) => {
  const selection = editor.selection || editor.savedSelection;

  const [node] = Editor.nodes(editor, {
    match: (n) => n.type === elementType,
    at: selection,
  });
  return node;
};
