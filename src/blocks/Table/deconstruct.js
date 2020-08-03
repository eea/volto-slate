import { v4 as uuid } from 'uuid';
import { Editor, Transforms } from 'slate';
import { TABLE, TD } from 'volto-slate/constants';

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
  const tables = tableNodes.map(([el]) => extractVoltoTable(el));

  Transforms.removeNodes(editor, {
    at: pathRef.current,
    match: (node) => node.type === TABLE,
  });

  return tables.map((el) => syncCreateTableBlock(el));
};

function collectRowsFrom(x) {
  let rows = [];
  x.children.forEach((y) => {
    if (y.type === 'tr') {
      let row = { key: uuid(), cells: [] };

      y.children.forEach((z) => {
        let val = JSON.parse(JSON.stringify(z.children));
        if (z.type === 'td') {
          row.cells.push({
            key: uuid(),
            type: 'data',
            value: val,
          });
        } else if (z.type === 'th') {
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
  el.children.forEach((x) => {
    if (x.type === 'thead') {
      // not supported by View fully, so prepend this to tbody below
      thead = collectRowsFrom(x);
    } else if (x.type === 'tbody') {
      tbody = collectRowsFrom(x);
    } else if (x.type === 'tfoot') {
      // not supported by View fully, so append this to tbody below
      tfoot = collectRowsFrom(x);
    }
  });

  const rows = [...thead, ...tbody, ...tfoot];

  // console.log('SLATE:', el);
  // console.log('VOLTO:', rows);
  return rows;
}

// import { v4 as uuid } from 'uuid';
// import { Transforms } from 'slate';
// import { IMAGE } from 'volto-slate/constants';
// import { jsx } from 'slate-hyperscript';
// import { getBaseUrl } from '@plone/volto/helpers';
// import { createSlateTableBlock } from 'volto-slate/utils';
// export const deserializeTableTag = (editor, el) => {
//   if (el.localName !== 'table') {
//     return null;
//   }
//
//   let rows = [];
//
//   el.querySelectorAll('tr').forEach((val, idx) => {
//     let row = { key: uuid(), cells: [] };
//     val.childNodes.forEach((val2, idx2) => {
//       let ds = deserialize(editor, val2);
//
//       function dsx(ds) {
//         return Array.isArray(ds)
//           ? ds.map((x) => {
//               if (typeof x === 'string') {
//                 return { type: 'p', children: [{ text: x }] };
//               }
//               return dsx(x);
//             })
//           : ds;
//       }
//       ds = dsx(ds);
//
//       if (val2.localName === 'th') {
//         row.cells.push({
//           key: uuid(),
//           type: 'header',
//           value: ds,
//         });
//       } else if (val2.localName === 'td') {
//         row.cells.push({
//           key: uuid(),
//           type: 'data',
//           value: ds,
//         });
//       }
//     });
//
//     rows.push(row);
//   });
//
//   console.log('TABLE', rows);
//
//   // TODO: get the correct index here
//
//   // const { onChangeBlock, onAddBlock } = editor.getBlockProps();
//   // createSlateTableBlock(rows, 0, { onChangeBlock, onAddBlock });
//
//   // const attrs = { type: IMAGE };
//
//   // for (const name of el.getAttributeNames()) {
//   //   attrs[name] = el.getAttribute(name);
//   // }
//
//   // return jsx('text', {}, '');
//   // return [jsx('element', attrs, [{ text: '' }]), jsx('text', {}, '')];
//   return null; // [jsx('element', attrs, [{ text: '' }])];
// };
