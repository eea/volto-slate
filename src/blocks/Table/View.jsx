/**
 * Slate Table block's View component.
 * @module volto-slate/blocks/Table/View
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';
import { map } from 'lodash';
import { serializeNodes } from 'volto-slate/editor/render';
import { Node } from 'slate';

// TODO: loading LESS files with `volto-slate/...` paths does not work currently
import '../../editor/plugins/Table/less/public.less';

/**
 * Slate Table block's View class.
 * @class View
 * @extends Component
 * @param {object} data The table data to render as a table.
 */
const View = ({ data }) => {
  return (
    <>
      {data && data.table && (
        <Table
          fixed={data.table.fixed}
          compact={data.table.compact}
          basic={data.table.basic ? 'very' : false}
          celled={data.table.celled}
          inverted={data.table.inverted}
          striped={data.table.striped}
        >
          <Table.Body>
            {map(data.table.rows, (row) => (
              <Table.Row key={row.key}>
                {map(row.cells, (cell) => (
                  <Table.Cell
                    key={cell.key}
                    as={cell.type === 'header' ? 'th' : 'td'}
                  >
                    {cell.value &&
                    Node.string({ children: cell.value }).length > 0
                      ? serializeNodes(cell.value)
                      : '\u00A0'}

                    {/* TODO: above use blockHasValue from the Slate Volto addon block's metadata */}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
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

export default View;
