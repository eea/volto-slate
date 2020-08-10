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
        <Dropdown.Menu className="slate-table-dropdown-menu">
          <TableContainer
            rowCount={5}
            columnCount={5}
            activeColumn={1}
            activeRow={1}
            onCellMouseEnter={() => {}}
            onCellMouseLeave={() => {}}
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
