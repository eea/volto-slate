import cx from 'classnames';
import React from 'react';
import { Menu as UIMenu, Ref } from 'semantic-ui-react';

const Menu = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <Ref innerRef={ref}>
      <UIMenu {...props} className={cx(className, 'slate-menu')} />
    </Ref>
  );
});

export default Menu;
