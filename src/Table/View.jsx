/**
 * View table block.
 * @module components/manage/Blocks/Table/View
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';
import { map } from 'lodash';
import TextBlockView from '../TextBlock/TextBlockView';
import { Node } from 'slate';

import { settings } from '~/config';

/**
 * View table block class.
 * @class View
 * @extends Component
 */
const View = ({ data }) => (
  <p>
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
                  {cell.value && Node.string(cell.value[0]).length > 0 ? (
                    <TextBlockView data={{ value: cell.value }} />
                  ) : (
                    '\u00A0'
                  )}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )}
  </p>
);

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
View.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default View;
