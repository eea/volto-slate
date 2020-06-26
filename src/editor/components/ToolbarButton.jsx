import cx from 'classnames';
import React from 'react';
import { Icon } from '@plone/volto/components';
import { Button } from 'semantic-ui-react';

const ToolbarButton = React.forwardRef(
  ({ className, active, reversed, icon, style, ...props }, ref) => {
    return (
      <Button
        {...props}
        ref={ref}
        style={style}
        className={cx(className)}
        active={active}
        inverted={reversed}
        compact={true}
        toggle={true}
        size="mini"
      >
        {icon && <Icon name={icon} size="17px" />}
      </Button>
    );
  },
);

export default ToolbarButton;
