import cx from 'classnames';
import React from 'react';
import { Icon } from '@plone/volto/components';
import { Button } from 'semantic-ui-react';

const ToolbarButton = React.forwardRef(
  ({ className, active, reversed, icon, style, ...props }, ref) => {
    const newProps = { ...props };
    delete newProps.keepHoveringToolbarOpen;
    delete newProps.setKeepHoveringToolbarOpen;

    return (
      <div className="button-wrapper">
        <Button
          as="a"
          {...newProps}
          ref={ref}
          style={style}
          className={cx(className)}
          active={active}
          inverted={reversed}
          compact
          toggle
          size="tiny"
          icon={icon && <Icon name={icon} size="24px" />}
        ></Button>
      </div>
    );
  },
);

export default ToolbarButton;
