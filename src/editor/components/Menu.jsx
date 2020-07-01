import cx from 'classnames';
import React from 'react';
import { Menu as UIMenu, Button, Ref } from 'semantic-ui-react';

const Menu = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <Ref innerRef={ref}>
      <UIMenu className={cx(className, 'slate-menu')}>
        <Button.Group {...props} />
      </UIMenu>
    </Ref>
  );
});

export default Menu;
