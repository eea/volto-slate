import titleSVG from '@plone/volto/icons/text.svg';
import TitleBlockView from './TitleBlockView';
import TitleBlockEdit from './TitleBlockEdit';

export default (config) => {
  config.blocks.blocksConfig.title = {
    id: 'title',
    title: 'Title',
    icon: titleSVG,
    group: 'text',
    view: TitleBlockView,
    edit: TitleBlockEdit,
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

// TODO: similarly create a Description block including these code snippets:

// import descriptionSVG from '@plone/volto/icons/description.svg';

// config.blocks.blocksConfig.description = {
//   id: 'description',
//   title: 'Description',
//   icon: descriptionSVG,
//   group: 'text',
//   view: ViewDescriptionBlock,
//   edit: EditDescriptionBlock,
//   restricted: true,
//   mostUsed: false,
//   blockHasOwnFocusManagement: true,
//   sidebarTab: 0,
//   security: {
//     addPermission: [],
//     view: [],
//   },
// };
