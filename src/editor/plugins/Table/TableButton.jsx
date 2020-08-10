import React from 'react';
import { useSlate } from 'slate-react';
import { Dropdown } from 'semantic-ui-react';
import { ToolbarButton } from 'volto-slate/editor/ui';
// import { isLinkActive, insertLink, unwrapLink } from './utils';

import tableSVG from '@plone/volto/icons/table.svg';

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
            onMouseEnter={() => {
              setDropdownOpen(true);
            }}
            onMouseLeave={(e) => {
              // const menu = document.querySelector('.slate-table-dropdown-menu');

              // const hover = document.querySelector(':hover');

              // const cond = !menu.contains(hover);

              // debugger;

              // if (cond) {
              setDropdownOpen(false);
              // }
            }}
            icon={tableSVG}
          ></ToolbarButton>
        }
      >
        <Dropdown.Menu
          className="slate-table-dropdown-menu"
          onMouseEnter={() => {
            setDropdownOpen(true);
          }}
          onMouseLeave={() => {
            setDropdownOpen(false);
          }}
        >
          <table style={{ width: '10rem', height: '10rem' }}>
            <tr>
              <td>A</td>
              <td>B</td>
            </tr>
            <tr>
              <td>C</td>
              <td>D</td>
            </tr>
          </table>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default TableButton;
