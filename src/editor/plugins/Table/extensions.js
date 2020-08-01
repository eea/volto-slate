// import { Transforms } from 'slate';
// import { IMAGE } from 'volto-slate/constants';
// import { jsx } from 'slate-hyperscript';
// import { getBaseUrl } from '@plone/volto/helpers';
import { v4 as uuid } from 'uuid';
import { createSlateTableBlock } from 'volto-slate/utils';
import { deserialize } from 'volto-slate/editor/deserialize';

export const deserializeTableTag = (editor, el) => {
  if (el.localName !== 'table') {
    return null;
  }

  let rows = [];

  el.querySelectorAll('tr').forEach((val, idx) => {
    let row = { key: uuid(), cells: [] };
    val.childNodes.forEach((val2, idx2) => {
      let ds = deserialize(editor, val2);

      function dsx(ds) {
        return Array.isArray(ds)
          ? ds.map((x) => {
              if (typeof x === 'string') {
                return { type: 'p', children: [{ text: x }] };
              }
              return dsx(x);
            })
          : ds;
      }
      ds = dsx(ds);

      if (val2.localName === 'th') {
        row.cells.push({
          key: uuid(),
          type: 'header',
          value: ds,
        });
      } else if (val2.localName === 'td') {
        row.cells.push({
          key: uuid(),
          type: 'data',
          value: ds,
        });
      }
    });

    rows.push(row);
  });

  // console.log('TABLE', rows);

  // TODO: get the correct index here

  // const { onChangeBlock, onAddBlock } = editor.getBlockProps();
  // createSlateTableBlock(rows, 0, { onChangeBlock, onAddBlock });

  // const attrs = { type: IMAGE };

  // for (const name of el.getAttributeNames()) {
  //   attrs[name] = el.getAttribute(name);
  // }

  // return jsx('text', {}, '');
  // return [jsx('element', attrs, [{ text: '' }]), jsx('text', {}, '')];
  return null; // [jsx('element', attrs, [{ text: '' }])];
};

/**
 * Allows for pasting tables from clipboard.
 * Not yet: dragging and dropping tables; tables from Excel and other apps.
 */
export const withTablePaste = (editor) => {
  editor.htmlTagsToSlate = {
    ...editor.htmlTagsToSlate,
    TABLE: deserializeTableTag,
  };

  return editor;
};
