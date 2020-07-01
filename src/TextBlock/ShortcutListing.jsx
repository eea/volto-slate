import { Segment, List } from 'semantic-ui-react';
import { settings } from '~/config';
import React from 'react';

const ShortcutListing = (props) => {
  const hotkeys = settings?.slate?.hotkeys;
  return (
    <Segment>
      <h3>Text editor shortcuts</h3>
      <List>
        {hotkeys &&
          Object.entries(hotkeys).map(([shortcut, format]) => (
            <List.Item key={shortcut}>{`${shortcut}: ${format}`}</List.Item>
          ))}
      </List>
    </Segment>
  );
};

export default ShortcutListing;
