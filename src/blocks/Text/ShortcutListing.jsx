import { Segment, List } from 'semantic-ui-react';
import { settings } from '~/config';
import React from 'react';

const ShortcutListing = (props) => {
  const hotkeys = settings?.slate?.hotkeys;
  return (
    <div>
      <header className="header">
        <h2>Editor shortcuts</h2>
      </header>

      <Segment secondary attached>
        <List>
          {Object.entries(hotkeys || {}).map(([shortcut, format]) => (
            <List.Item key={shortcut}>{`${shortcut}: ${format}`}</List.Item>
          ))}
        </List>
      </Segment>
    </div>
  );
};

export default ShortcutListing;
