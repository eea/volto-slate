import React from 'react';
import titleSVG from '@plone/volto/icons/text.svg';
import TitleBlockView from './TitleBlockView';
import TitleBlockEdit from './TitleBlockEdit';

export default (config) => {
  const className = 'documentFirstHeading';
  const formFieldName = 'title';

  config.blocks.blocksConfig.title = {
    id: 'title',
    title: 'Title',
    icon: titleSVG,
    group: 'text',
    view: (props) => (
      <TitleBlockView
        {...props}
        className={className}
        formFieldName={formFieldName}
      />
    ),
    edit: (props) => (
      <TitleBlockEdit
        {...props}
        className={className}
        formFieldName={formFieldName}
      />
    ),
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
