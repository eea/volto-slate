// import { Button as UIButton } from 'semantic-ui-react';

import cx from 'classnames';
import React from 'react';
import { Icon } from '@plone/volto/components';
import { useSlate } from 'slate-react';
import { isBlockActive, isMarkActive, toggleBlock, toggleMark } from './utils';

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
export const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
      icon={icon}
    />
  );
};

export const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      icon={icon}
    />
  );
};

export const Menu = React.forwardRef(({ className, ...props }, ref) => (
  <div {...props} ref={ref} className={cx(className, 'slate-menu')} />
));

export const Toolbar = React.forwardRef(({ className, ...props }, ref) => (
  <Menu {...props} ref={ref} className={cx(className, 'slate-toolbar')} />
));
