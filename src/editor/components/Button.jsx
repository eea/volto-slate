import cx from 'classnames';
import React from 'react';
import { Icon } from '@plone/volto/components';
import { Button as UIButton } from 'semantic-ui-react';

const Button = React.forwardRef(
  ({ className, active, reversed, icon, style, ...props }, ref) => {
    return (
      <UIButton
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
        {icon && <Icon name={icon} size="24px" />}
      </UIButton>
    );
  },
);

export default Button;
