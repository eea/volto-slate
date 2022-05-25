import React, { useState, useMemo } from 'react';
import { map } from 'lodash';
import { Table } from 'semantic-ui-react';
import {
  serializeNodes,
  serializeNodesToText,
} from 'volto-slate/editor/render';
import { Node } from 'slate';

const ResponsiveTable = ({ data, headers, rows }) => {
  const [state, setState] = useState({
    column: null,
    direction: null,
  });

  const sortedRows = useMemo(() => {
    if (state.column === null) return Object.keys(rows);
    return Object.keys(rows).sort((a, b) => {
      const a_text = rows[a][state.column].valueText;
      const b_text = rows[b][state.column].valueText;
      if (state.direction === 'ascending' ? a_text < b_text : a_text > b_text) {
        return -1;
      }
      if (state.direction === 'ascending' ? a_text > b_text : a_text < b_text) {
        return 1;
      }
      return 0;
    });
  }, [state, rows]);

  return (
    <Table
      fixed={data.table.fixed}
      compact={data.table.compact}
      basic={data.table.basic ? 'very' : false}
      celled={data.table.celled}
      inverted={data.table.inverted}
      striped={data.table.striped}
      sortable={data.table.sortable}
      className="slate-table-block responsive"
    >
      {!data.table.hideHeaders ? (
        <Table.Header>
          <Table.Row>
            {headers.map((cell, index) => (
              <Table.HeaderCell
                key={cell.key}
                textAlign="center"
                verticalAlign="middle"
                sorted={state.column === index ? state.direction : null}
                onClick={() => {
                  if (!data.table.sortable) return;
                  setState({
                    column: index,
                    direction:
                      state.column !== index
                        ? 'ascending'
                        : state.direction === 'ascending'
                        ? 'descending'
                        : 'ascending',
                  });
                }}
              >
                {cell.value && Node.string({ children: cell.value }).length > 0
                  ? serializeNodes(cell.value)
                  : '\u00A0'}
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
      ) : (
        ''
      )}
      <Table.Body>
        {map(sortedRows, (row) => (
          <Table.Row key={row}>
            {map(rows[row], (cell, cellIndex) => (
              <Table.Cell
                key={cell.key}
                data-label={serializeNodesToText(headers[cellIndex].value)}
                textAlign={data.table.textAlign || 'center'}
                verticalAlign={data.table.verticalAlign || 'middle'}
              >
                {cell.value}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default ResponsiveTable;
