import React from 'react';
import cx from 'classnames';

import Toolbar from './Toolbar';
import ExpandedToolbar from './ExpandedToolbar';
import { settings } from '~/config';

const SlateToolbar = (props) => {
  const { selected, showToolbar, setShowToolbar } = props;
  const { slate } = settings;
  const { toolbarButtons, expandedToolbarButtons, buttons } = slate;
  return (
    <>
      {!showToolbar && (
        <Toolbar
          onToggle={() => setShowToolbar(!showToolbar)}
          mainToolbarShown={showToolbar}
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
            onToggle={() => setShowToolbar(!showToolbar)}
            mainToolbarShown={showToolbar}
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
