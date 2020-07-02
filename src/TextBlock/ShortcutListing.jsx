import { Segment, List } from 'semantic-ui-react';
import { settings } from '~/config';
import React from 'react';

const ShortcutListing = (props) => {
  const hotkeys = settings?.slate?.hotkeys;
  return (
    <Segment.Group raised className="form">
      <header className="header pulled">
        <h2>Text editor shortcuts</h2>
      </header>

      <Segment secondary attached>
        <List>
          {hotkeys &&
            Object.entries(hotkeys).map(([shortcut, format]) => (
              <List.Item key={shortcut}>{`${shortcut}: ${format}`}</List.Item>
            ))}
        </List>
      </Segment>
    </Segment.Group>
  );
};

export default ShortcutListing;
