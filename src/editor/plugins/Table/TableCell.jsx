import React from 'react';

export const TableCell = ({
  active,
  row,
  column,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const handleClick = React.useCallback(
    (ev) => {
      onClick({ row, column });
    },
    [column, onClick, row],
  );

  const handleMouseEnter = React.useCallback(
    (ev) => {
      onMouseEnter({ row, column });
    },
    [column, onMouseEnter, row],
  );

  const handleMouseLeave = React.useCallback(
    (ev) => {
      onMouseLeave({ row, column });
    },
    [column, onMouseLeave, row],
  );

  return (
    <td onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button onClick={handleClick} style={{ opacity: 0 }}></button>
    </td>
  );
};

export default TableCell;
