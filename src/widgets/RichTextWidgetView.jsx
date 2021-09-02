import React from 'react';
import cx from 'classnames';
import config from '@plone/volto/registry';
import { ErrorBoundary } from './ErrorBoundary';
import './style.css';

export const SlateRichTextWidgetView = ({ value, children, className }) => {
  const Block = config.blocks.blocksConfig.slate.view;
  return value ? (
    <ErrorBoundary name={className}>
      <div className={cx(className, 'slate', 'widget')}>
        <Block data={{ value: value }}>{children}</Block>
      </div>
    </ErrorBoundary>
  ) : (
    ''
  );
};

export default SlateRichTextWidgetView;
