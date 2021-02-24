/**
 * This is the main toolbar, which:
 *
 * - appears only when a range selection exists
 * - can be toggled between expanded and hovering state
 *
 */

import React from 'react';
import cx from 'classnames';

import toggleIcon from '@plone/volto/icons/more.svg';

import Toolbar from './Toolbar';
import ExpandedToolbar from './ExpandedToolbar';
import ToolbarButton from './ToolbarButton';

import config from '@plone/volto/registry';

const SlateToolbar = (props) => {
  const { selected, showToolbar, setShowToolbar, className } = props;
  const { slate } = config.settings;
  const { toolbarButtons, expandedToolbarButtons, buttons } = slate;

  function renderButton(name, index) {
    const Btn = buttons[name];
    // using also name because some buttons can be like "Separator"
    return <Btn key={`${name}-${index}`} />;
  }

  return (
    <>
      {!showToolbar && (
        <Toolbar
          toggleButton={
            <ToolbarButton
              title="More..."
              onMouseDown={(event) => {
                setShowToolbar(!showToolbar);
                event.preventDefault();
              }}
              icon={toggleIcon}
              active={showToolbar}
            />
          }
          className={className}
        >
          {toolbarButtons?.map(renderButton)}
        </Toolbar>
      )}
      <div
        className={cx('toolbar-wrapper', { active: showToolbar && selected })}
      >
        {selected && showToolbar && (
          <ExpandedToolbar
            toggleButton={
              <ToolbarButton
                title="Less..."
                onMouseDown={(event) => {
                  setShowToolbar(!showToolbar);
                  event.preventDefault();
                }}
                icon={toggleIcon}
                active={showToolbar}
              />
            }
          >
            {expandedToolbarButtons?.map(renderButton)}
          </ExpandedToolbar>
        )}
      </div>
    </>
  );
};

export default SlateToolbar;
