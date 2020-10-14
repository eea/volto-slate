import { Segment, List } from 'semantic-ui-react';
import { settings } from '~/config';
import React from 'react';

/**
 * Displays the registered hotkeys for keyboard as they are in the settings.
 *
 * @param {object} props Unused.
 */
const ShortcutListing = (props) => {
  const hotkeys = settings?.slate?.hotkeys;
  return (
    <div>
      <header className="header">
        <h2>Editor shortcuts</h2>
      </header>

      <Segment secondary attached>
        <List>
          {Object.entries(hotkeys || {}).map(([shortcut, { format, type }]) => (
            <List.Item key={shortcut}>{`${shortcut}: ${format}`}</List.Item>
          ))}
        </List>
        {/* TODO: Eventually detect the OS automatically from the user agent
            and display just the relevant information in the following
            element: */}
        <div>On Windows, the MOD key is Ctrl, on Mac OS X it's Cmd.</div>
      </Segment>
    </div>
  );
};

export default ShortcutListing;
