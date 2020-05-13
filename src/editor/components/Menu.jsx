import cx from 'classnames';
import React from 'react';

const Menu = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div ref={ref} {...props} className={cx(className, 'slate-menu')}></div>
  );
});

export default Menu;
