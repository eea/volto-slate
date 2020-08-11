import React from 'react';
import { useSlate } from 'slate-react';
import { Dropdown } from 'semantic-ui-react';
import { ToolbarButton } from 'volto-slate/editor/ui';
import { v4 as uuid } from 'uuid';

import { createSlateTableBlock } from 'volto-slate/utils';
import tableSVG from '@plone/volto/icons/table.svg';
import TableContainer from './TableContainer';
import './less/table.less';

const TableButton = () => {
  const editor = useSlate();

  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const [activeRow, setActiveRow] = React.useState(1);
  const [activeColumn, setActiveColumn] = React.useState(1);

  const defaultRowCount = 5;
  const defaultColumnCount = 5;

  const [rowCount, setRowCount] = React.useState(defaultRowCount);
  const [columnCount, setColumnCount] = React.useState(defaultColumnCount);

  const resetState = React.useCallback(() => {
    setRowCount(defaultRowCount);
    setColumnCount(defaultColumnCount);
    setActiveRow(1);
    setActiveColumn(1);
  }, []);

  const createEmptyCell = React.useCallback(() => {
    return {
      key: uuid(),
      type: 'data',
      value: [{ type: 'p', children: [{ text: '' }] }],
    };
  }, []);

  const createEmptyRow = React.useCallback(
    (cellCount) => {
      const cells = [];

      for (let i = 0; i < cellCount; ++i) {
        cells.push(createEmptyCell());
      }

      return {
        key: uuid(),
        cells,
      };
    },
    [createEmptyCell],
  );

  return (
    <>
      <Dropdown
        open={dropdownOpen}
        onClose={() => {
          resetState();
          setDropdownOpen(false);
        }}
        trigger={
          <ToolbarButton
            className="slate-table-dropdown-button"
            onClick={() => {
              if (dropdownOpen) {
                resetState();
              }

              setDropdownOpen(!dropdownOpen);
            }}
            icon={tableSVG}
          ></ToolbarButton>
        }
      >
        <Dropdown.Menu className="slate-table-dropdown-menu">
          <TableContainer
            rowCount={rowCount}
            columnCount={columnCount}
            activeColumn={activeColumn}
            activeRow={activeRow}
            onCellMouseEnter={({ row, column }) => {
              if (row > rowCount - 1) {
                setRowCount(row + 1);
              } else if (row < rowCount - 1) {
                setRowCount(defaultRowCount);
              }

              if (column > columnCount - 1) {
                setColumnCount(column + 1);
              } else if (column < columnCount - 1) {
                setColumnCount(defaultColumnCount);
              }

              if (row !== activeRow) {
                setActiveRow(row);
              }
              if (column !== activeColumn) {
                setActiveColumn(column);
              }
            }}
            onCellMouseLeave={({ row, column }) => {}}
            // `row` and `column` below are 1-based indices
            onCellClick={({ row, column }) => {
              const {
                onChangeBlock,
                onAddBlock,
                index,
                onFocusNextBlock,
                block,
                blockNode,
              } = editor.getBlockProps();

              const rows = [];
              for (let i = 0; i < row; ++i) {
                rows.push(createEmptyRow(column));
              }

              createSlateTableBlock(rows, index, {
                onChangeBlock,
                onAddBlock,
              }).then(() => {
                // blockNode is a ref
                onFocusNextBlock(block, blockNode.current);
              });
            }}
          />
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default TableButton;
