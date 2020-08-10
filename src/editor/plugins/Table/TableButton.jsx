import React from 'react';
// import { useSlate } from 'slate-react';
import { Dropdown } from 'semantic-ui-react';
import { ToolbarButton } from 'volto-slate/editor/ui';
// import { isLinkActive, insertLink, unwrapLink } from './utils';

import tableSVG from '@plone/volto/icons/table.svg';
import TableContainer from './TableContainer';
import './less/table.less';

const TableButton = () => {
  // const editor = useSlate();

  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const [activeRow, setActiveRow] = React.useState(1);
  const [activeColumn, setActiveColumn] = React.useState(1);

  const defaultRowCount = 5;
  const defaultColumnCount = 5;

  const [rowCount, setRowCount] = React.useState(defaultRowCount);
  const [columnCount, setColumnCount] = React.useState(defaultColumnCount);

  return (
    <>
      <Dropdown
        open={dropdownOpen}
        trigger={
          <ToolbarButton
            className="slate-table-dropdown-button"
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
            }}
            icon={tableSVG}
          ></ToolbarButton>
        }
      >
        <Dropdown.Menu
          className="slate-table-dropdown-menu"
          onMouseLeave={() => {
            setRowCount(defaultRowCount);
            setColumnCount(defaultColumnCount);
            setActiveRow(1);
            setActiveColumn(1);
          }}
        >
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
            onCellClick={({ row, column }) => {
              alert(`row: ${row}\ncolumn: ${column}`);
            }}
          />
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default TableButton;
