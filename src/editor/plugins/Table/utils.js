import { Range, Transforms, Editor, Path } from 'slate';
import { TABLE, TR, P, TD, TH } from 'volto-slate/constants';

const unhangRange = (editor, options = {}) => {
  const { at = editor.selection, voids, unhang = true } = options;

  if (Range.isRange(at) && unhang) {
    options.at = Editor.unhangRange(editor, at, { voids });
  }
};

const getNodes = (editor, options = {}) => {
  unhangRange(editor, options);

  return Editor.nodes(editor, options);
};

const findNode = (editor, options = {}) => {
  try {
    const nodeEntries = getNodes(editor, {
      at: editor.selection || editor.getSavedSelection() || [],
    });

    for (const [node, path] of nodeEntries) {
      return [node, path];
    }
  } catch (error) {
    return undefined;
  }
};

const someNode = (editor, options) => {
  return !!findNode(editor, options);
};

const getEmptyCellNode = (editor, { header }) => {
  return {
    type: header ? TH : TD,
    children: [{ type: P, children: [{ text: '' }] }],
  };
};

const getEmptyRowNode = (editor, { header, colCount }) => {
  return {
    type: TR,
    children: Array(colCount)
      .fill(colCount)
      .map(() => getEmptyCellNode(editor, { header })),
  };
};

export const addRowBefore = (editor, { header } = {}) => {
  if (someNode(editor, { match: (n) => n.type === TABLE })) {
    const currentRowItem = Editor.above(editor, {
      match: (n) => n.type === TR,
    });
    if (currentRowItem) {
      const [currentRowElem, currentRowPath] = currentRowItem;
      Transforms.insertNodes(
        editor,
        getEmptyRowNode(editor, {
          header,
          colCount: currentRowElem.children.length,
        }),
        {
          at: currentRowPath,
          select: true, // TODO: this and similar lines in the Table plugin do nothing currently, why?
        },
      );
    }
  }
};

export const addRowAfter = (editor, { header } = {}) => {
  if (someNode(editor, { match: (n) => n.type === TABLE })) {
    const currentRowItem = Editor.above(editor, {
      match: (n) => n.type === TR,
    });
    if (currentRowItem) {
      const [currentRowElem, currentRowPath] = currentRowItem;
      Transforms.insertNodes(
        editor,
        getEmptyRowNode(editor, {
          header,
          colCount: currentRowElem.children.length,
        }),
        {
          at: Path.next(currentRowPath),
          select: true,
        },
      );
    }
  }
};

export const deleteRow = (editor) => {
  if (someNode(editor, { match: (n) => n.type === TABLE })) {
    const currentTableItem = Editor.above(editor, {
      match: (n) => n.type === TABLE,
    });
    const currentRowItem = Editor.above(editor, {
      match: (n) => n.type === TR,
    });
    if (
      currentRowItem &&
      currentTableItem &&
      // Cannot delete the last row
      // TODO: handle tfoot and thead Element types here:
      currentTableItem[0].children[0].children.length > 1
    ) {
      Transforms.removeNodes(editor, { at: currentRowItem[1] });
    }
  }
};

export const addColBefore = (editor, { header } = {}) => {
  if (someNode(editor, { match: (n) => n.type === TABLE })) {
    const currentCellItem = Editor.above(editor, {
      match: (n) => n.type === TH || n.type === TD,
    });
    const currentTableItem = Editor.above(editor, {
      match: (n) => n.type === TABLE,
    });

    if (currentCellItem && currentTableItem) {
      const nextCellPath = currentCellItem[1];
      const newCellPath = nextCellPath.slice();
      const replacePathPos = newCellPath.length - 2;
      const currentRowIdx = nextCellPath[replacePathPos];

      // TODO: handle tfoot and thead too:
      currentTableItem[0].children[0].children.forEach((row, rowIdx) => {
        newCellPath[replacePathPos] = rowIdx;
        const isHeaderRow =
          header === undefined ? row.children[0].type === TH : header;

        Transforms.insertNodes(
          editor,
          getEmptyCellNode(editor, { header: isHeaderRow }),
          {
            at: newCellPath,
            select: rowIdx === currentRowIdx,
          },
        );
      });
    }
  }
};

export const addColAfter = (editor, { header } = {}) => {
  if (someNode(editor, { match: (n) => n.type === TABLE })) {
    const currentCellItem = Editor.above(editor, {
      match: (n) => n.type === TH || n.type === TD,
    });
    const currentTableItem = Editor.above(editor, {
      match: (n) => n.type === TABLE,
    });

    if (currentCellItem && currentTableItem) {
      const nextCellPath = Path.next(currentCellItem[1]);
      const newCellPath = nextCellPath.slice();
      const replacePathPos = newCellPath.length - 2;
      const currentRowIdx = nextCellPath[replacePathPos];

      // TODO: handle tfoot and thead too:
      currentTableItem[0].children[0].children.forEach((row, rowIdx) => {
        newCellPath[replacePathPos] = rowIdx;
        const isHeaderRow =
          header === undefined ? row.children[0].type === TH : header;

        Transforms.insertNodes(
          editor,
          getEmptyCellNode(editor, { header: isHeaderRow }),
          {
            at: newCellPath,
            select: rowIdx === currentRowIdx,
          },
        );
      });
    }
  }
};

export const deleteCol = (editor) => {
  if (someNode(editor, { match: (n) => n.type === TABLE })) {
    const currentCellItem = Editor.above(editor, {
      match: (n) => n.type === TD || n.type === TH,
    });
    const currentRowItem = Editor.above(editor, {
      match: (n) => n.type === TR,
    });
    const currentTableItem = Editor.above(editor, {
      match: (n) => n.type === TABLE,
    });

    if (
      currentCellItem &&
      currentRowItem &&
      currentTableItem &&
      // Cannot delete the last cell
      currentRowItem[0].children.length > 1
    ) {
      const currentCellPath = currentCellItem[1];
      const pathToDelete = currentCellPath.slice();
      const replacePathPos = pathToDelete.length - 2;

      // TODO: handle tfoot and thead too:
      currentTableItem[0].children[0].children.forEach((row, rowIdx) => {
        pathToDelete[replacePathPos] = rowIdx;

        Transforms.removeNodes(editor, {
          at: pathToDelete,
        });
      });
    }
  }
};
