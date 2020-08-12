import React from 'react';
import descriptionSVG from '@plone/volto/icons/description.svg';
import TitleBlockView from '../Title/TitleBlockView';
import TitleBlockEdit from '../Title/TitleBlockEdit';

export default (config) => {
  const className = 'documentDescription';

  config.blocks.blocksConfig.description = {
    id: 'description',
    title: 'Description',
    icon: descriptionSVG,
    group: 'text',
    view: (props) => <TitleBlockView {...props} className={className} />,
    edit: (props) => <TitleBlockEdit {...props} className={className} />,
    restricted: true,
    mostUsed: false,
    blockHasOwnFocusManagement: true,
    sidebarTab: 0,
    security: {
      addPermission: [],
      view: [],
    },
  };

  return config;
};
