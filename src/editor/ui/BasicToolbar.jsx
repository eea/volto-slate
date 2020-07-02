import cx from 'classnames';
import React from 'react';
import Menu from './Menu';

const BasicToolbar = React.forwardRef(({ className, ...props }, ref) => {
  // {/* <Menu {...props} ref={ref} className={cx(className, 'slate-toolbar')} /> */}
  return (
    <Menu {...props} ref={ref} className={cx(className, 'slate-toolbar')} />
  );
});

export default BasicToolbar;
