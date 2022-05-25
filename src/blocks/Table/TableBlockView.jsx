/**
 * Slate Table block's View component.
 * @module volto-slate/blocks/Table/View
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withBlockExtensions } from '@plone/volto/helpers';
import {
  serializeNodes,
  serializeNodesToText,
} from 'volto-slate/editor/render';
import { Node } from 'slate';

// TODO: loading LESS files with `volto-slate/...` paths does not work currently
import '../../editor/plugins/Table/less/public.less';

/**
 * Slate Table block's View class.
 * @class View
 * @extends Component
 * @param {object} data The table data to render as a table.
 */
const View = (props) => {
  const { data } = props;

  const headers = useMemo(() => {
    return data.table.rows?.[0]?.cells;
  }, [data.table.rows]);

  const rows = useMemo(() => {
    const items = {};
    if (!data.table.rows) return {};
    data.table.rows.forEach((row, index) => {
      if (index > 0) {
        items[row.key] = [];
        row.cells.forEach((cell, cellIndex) => {
          items[row.key][cellIndex] = {
            ...cell,
            value:
              cell.value && Node.string({ children: cell.value }).length > 0
                ? serializeNodes(cell.value)
                : '\u00A0',
            valueText:
              cell.value && Node.string({ children: cell.value }).length > 0
                ? serializeNodesToText(cell.value)
                : '\u00A0',
          };
        });
      }
    });
    return items;
  }, [data.table.rows]);

  const Table = props.variation.view;

  return (
    <>
      {data && data.table && <Table {...props} headers={headers} rows={rows} />}
    </>
  );
};

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
View.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default withBlockExtensions(View);
