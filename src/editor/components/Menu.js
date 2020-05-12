import cx from 'classnames';
import React from 'react';

export const Menu = React.forwardRef(({ className, ...props }, ref) => (
  <div {...props} ref={ref} className={cx(className, 'slate-menu')}></div>
));
