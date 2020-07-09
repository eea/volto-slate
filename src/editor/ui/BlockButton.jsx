import React from 'react';
import { useSlate } from 'slate-react';
import { isBlockActive, toggleBlock } from 'volto-slate/utils';

import ToolbarButton from './ToolbarButton';

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();

  const isActive = isBlockActive(editor, format);

  const handleMouseDown = React.useCallback(
    (event) => {
      event.preventDefault();
      toggleBlock(editor, format);
    },
    [editor, format], // , isActive
  );

  return (
    <ToolbarButton
      active={isActive}
      onMouseDown={handleMouseDown}
      icon={icon}
    />
  );
};

export default BlockButton;
