import cx from 'classnames';
import React from 'react';
import { Icon } from '@plone/volto/components';

// import { Button as UIButton } from 'semantic-ui-react';

const Button = React.forwardRef(
  ({ className, active, reversed, icon, style, ...props }, ref) => {
    style = {
      ...style,
      cursor: 'pointer',
      padding: '4px !important',
      width: '32px',
      height: '32px',
      display: 'inline-block',
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
        {icon ? <Icon name={icon} size="24px" /> : 'no-icon'}
      </span>
    );
  },
);

export default Button;
