import React from 'react';
import { useSlate } from 'slate-react';

import { isMarkActive, toggleMark } from '../utils';
import ToolbarButton from './ToolbarButton';

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      icon={icon}
    />
  );
};

export default MarkButton;
