import React from 'react';
import TableCell from './TableCell';

export const TableSizePicker = ({
  rowCount,
  columnCount,
  activeRow,
  activeColumn,
  onCellClick,
  onCellMouseEnter,
  onCellMouseLeave,
}) => {
  const handleClick = React.useCallback(
    (...rest) => {
      onCellClick(...rest);
    },
    [onCellClick],
  );

  const handleMouseEnter = React.useCallback(
    (...rest) => {
      onCellMouseEnter(...rest);
    },
    [onCellMouseEnter],
  );

  const handleMouseLeave = React.useCallback(
    (...rest) => {
      onCellMouseLeave(...rest);
    },
    [onCellMouseLeave],
  );

  const createRow = React.useCallback(
    (rowIndex) => {
      const arr = [];
      for (let i = 0; i < columnCount; ++i) {
        arr.push(
          <TableCell
            row={rowIndex + 1}
            column={i + 1}
            active={rowIndex + 1 <= activeRow && i + 1 <= activeColumn}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          ></TableCell>,
        );
      }
      return <tr>{arr}</tr>;
    },
    [
      activeColumn,
      activeRow,
      columnCount,
      handleClick,
      handleMouseEnter,
      handleMouseLeave,
    ],
  );

  const rows = [];
  for (let i = 0; i < rowCount; ++i) {
    rows.push(createRow(i));
  }

  const zoomFactor = 1.5;

  return (
    <table
      style={{
        width: `${rowCount * zoomFactor}rem`,
        height: `${columnCount * zoomFactor}rem`,
      }}
    >
      {rows}
    </table>
  );
};

export default TableSizePicker;
