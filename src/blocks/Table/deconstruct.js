import { v4 as uuid } from 'uuid';
import { Editor, Transforms } from 'slate';
import { TABLE, THEAD, TBODY, TFOOT, TD, TH, TR } from 'volto-slate/constants';

export function syncCreateTableBlock(rows) {
  const id = uuid();
  const block = {
    '@type': 'slateTable',
    table: {
      rows,
    },
  };
  return [id, block];
}

export const extractTables = (editor, pathRef) => {
  const tableNodes = Array.from(
    Editor.nodes(editor, {
      at: pathRef.current,
      match: (node) => node.type === TABLE,
    }),
  );
  const tables = tableNodes.map(([node]) => extractVoltoTable(node));

  Transforms.removeNodes(editor, {
    at: pathRef.current,
    match: (node) => node.type === TABLE,
  });

  return tables.map((el) => syncCreateTableBlock(el));
};

function collectRowsFrom(fragment) {
  let rows = [];
  fragment.children.forEach((y) => {
    if (y.type === TR) {
      let row = { key: uuid(), cells: [] };

      y.children.forEach((z) => {
        let val = JSON.parse(JSON.stringify(z.children));
        if (z.type === TD) {
          row.cells.push({
            key: uuid(),
            type: 'data',
            value: val,
          });
        } else if (z.type === TH) {
          row.cells.push({
            key: uuid(),
            type: 'header',
            value: val,
          });
        }
      });

      rows.push(row);
    }
  });
  return rows;
}

function extractVoltoTable(el) {
  let thead = [],
    tfoot = [],
    tbody = [];
  el.children.forEach((fragment) => {
    if (fragment.type === THEAD) {
      // not supported by View fully, so prepend this to tbody below
      thead = collectRowsFrom(fragment);
    } else if (fragment.type === TBODY) {
      tbody = collectRowsFrom(fragment);
    } else if (fragment.type === TFOOT) {
      // not supported by View fully, so append this to tbody below
      tfoot = collectRowsFrom(fragment);
    }
  });

  const rows = [...thead, ...tbody, ...tfoot];

  return rows;
}
