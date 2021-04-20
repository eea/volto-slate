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
  const {
    selected,
    showExpandedToolbar,
    setShowExpandedToolbar,
    className,
  } = props;
  const { slate } = config.settings;
  const { toolbarButtons, expandedToolbarButtons, buttons } = slate;

  function renderButton(name, index) {
    const Btn = buttons[name];
    // using also name because some buttons can be like "Separator"
    return <Btn key={`${name}-${index}`} />;
  }

  return (
    <>
      {!showExpandedToolbar && (
        <Toolbar
          toggleButton={
            <ToolbarButton
              title="More..."
              onMouseDown={(event) => {
                setShowExpandedToolbar(!showExpandedToolbar);
                event.preventDefault();
              }}
              icon={toggleIcon}
              active={showExpandedToolbar}
            />
          }
          className={className}
        >
          {toolbarButtons?.map(renderButton)}
        </Toolbar>
      )}
      <div
        className={cx('toolbar-wrapper', {
          active: showExpandedToolbar && selected,
        })}
      >
        {selected && showExpandedToolbar && (
          <ExpandedToolbar
            toggleButton={
              <ToolbarButton
                title="Less..."
                onMouseDown={(event) => {
                  setShowExpandedToolbar(!showExpandedToolbar);
                  event.preventDefault();
                }}
                icon={toggleIcon}
                active={showExpandedToolbar}
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
