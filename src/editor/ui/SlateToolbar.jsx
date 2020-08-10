import React from 'react';
import cx from 'classnames';

import toggleIcon from '@plone/volto/icons/freedom.svg';

import Toolbar from './Toolbar';
import ExpandedToolbar from './ExpandedToolbar';
import ToolbarButton from './ToolbarButton';

import { settings } from '~/config';

const SlateToolbar = (props) => {
  const { selected, showToolbar, setShowToolbar } = props;
  const { slate } = settings;
  const { toolbarButtons, expandedToolbarButtons, buttons } = slate;
  return (
    <>
      {!showToolbar && (
        <Toolbar
          toggleButton={
            <ToolbarButton
              onMouseDown={(event) => {
                setShowToolbar(!showToolbar);
                event.preventDefault();
              }}
              icon={toggleIcon}
              active={showToolbar}
            />
          }
        >
          {toolbarButtons?.map((name, i) => (
            <React.Fragment key={`${name}-${i}`}>
              {buttons[name]()}
            </React.Fragment>
          ))}
        </Toolbar>
      )}
      <div
        className={cx('toolbar-wrapper', { active: showToolbar && selected })}
      >
        {selected && showToolbar && (
          <ExpandedToolbar
            toggleButton={
              <ToolbarButton
                onMouseDown={(event) => {
                  setShowToolbar(!showToolbar);
                  event.preventDefault();
                }}
                icon={toggleIcon}
                active={showToolbar}
              />
            }
          >
            {expandedToolbarButtons?.map((name, i) => (
              <React.Fragment key={`${name}-${i}`}>
                {buttons[name]()}
              </React.Fragment>
            ))}
          </ExpandedToolbar>
        )}
      </div>
    </>
  );
};

export default SlateToolbar;
