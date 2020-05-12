import cx from 'classnames';
import React from 'react';
import { Icon } from '@plone/volto/components';

// import { Button as UIButton } from 'semantic-ui-react';

export const Button = React.forwardRef(
  ({ className, active, reversed, icon, style, ...props }, ref) => {
    style = {
      ...style,
      cursor: 'pointer',
      color: reversed
        ? active
          ? 'white'
          : '#888'
        : active
        ? ' black'
        : '#888',
    };
    return (
      <span {...props} ref={ref} style={style} className={cx(className)}>
        <Icon name={icon} size="24px" />
      </span>
    );
  },
);
