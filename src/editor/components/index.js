// import { Button as UIButton } from 'semantic-ui-react';

import cx from 'classnames';
import React from 'react';
import { useSlate } from 'slate-react';
import { isMarkActive, toggleMark } from '../utils';

import { Button } from './Button';

export { Button };
export { HoveringSlateToolbar } from './HoveringToolbar';
export { Portal } from './Portal';
export { SlateToolbar } from './SlateToolbar';
export { BlockButton } from './BlockButton';
export { MasterToggleButton } from './MasterToggleButton';

export const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      icon={icon}
    />
  );
};

export const Menu = React.forwardRef(({ className, ...props }, ref) => (
  <div {...props} ref={ref} className={cx(className, 'slate-menu')} />
));

export const Toolbar = React.forwardRef(({ className, ...props }, ref) => (
  <Menu {...props} ref={ref} className={cx(className, 'slate-toolbar')} />
));
