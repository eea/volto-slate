import { Icon as VoltoIcon } from '@plone/volto/components';
import briefcaseSVG from '@plone/volto/icons/briefcase.svg';
import React from 'react';
import { List } from 'semantic-ui-react';

const FootList = () => (
  <List divided relaxed>
    <List.Item>
      {/* <List.Icon name="github" size="large" verticalAlign="middle" /> */}
      <List.Icon verticalAlign="middle">
        <VoltoIcon size="24px" name={briefcaseSVG} />
      </List.Icon>
      <List.Content>
        <List.Header as="a">Semantic-Org/Semantic-UI</List.Header>
      </List.Content>
    </List.Item>
    <List.Item>
      <List.Icon verticalAlign="middle">
        <VoltoIcon size="24px" name={briefcaseSVG} />
      </List.Icon>
      <List.Content>
        <List.Header as="a">Semantic-Org/Semantic-UI-Docs</List.Header>
      </List.Content>
    </List.Item>
    <List.Item>
      <List.Icon verticalAlign="middle">
        <VoltoIcon size="24px" name={briefcaseSVG} />
      </List.Icon>
      <List.Content>
        <List.Header as="a">Semantic-Org/Semantic-UI-Meteor</List.Header>
      </List.Content>
    </List.Item>
  </List>
);

export default FootList;
