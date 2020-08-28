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

import { settings } from '~/config';

const SlateToolbar = (props) => {
  const {
    selected,
    showToolbar,
    setShowToolbar,
    keepHoveringToolbarOpen,
    setKeepHoveringToolbarOpen,
  } = props;
  const { slate } = settings;
  const { toolbarButtons, expandedToolbarButtons, buttons } = slate;

  function renderButton(name, index) {
    const Btn = buttons[name];
    // console.log(
    //   'LOG',
    //   name,
    //   keepHoveringToolbarOpen,
    //   setKeepHoveringToolbarOpen,
    // );
    // using also name because some buttons can be like "Separator"
    return (
      <Btn
        key={`${name}-${index}`}
        keepHoveringToolbarOpen={keepHoveringToolbarOpen}
        setKeepHoveringToolbarOpen={setKeepHoveringToolbarOpen}
      />
    );
  }

  return (
    <>
      {!showToolbar && (
        <Toolbar
          keepHoveringToolbarOpen={keepHoveringToolbarOpen}
          setKeepHoveringToolbarOpen={setKeepHoveringToolbarOpen}
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
