import codeSVG from '@plone/volto/icons/code.svg';

import FootnotesBlockView from './FootnotesBlockView';
import FootnotesBlockEdit from './FootnotesBlockEdit';

export default function install(config) {
  config.blocks.blocksConfig.slateFootnotes = {
    id: 'slateFootnotes',
    title: 'Slate Footnotes',
    icon: codeSVG,
    group: 'text',
    view: FootnotesBlockView,
    edit: FootnotesBlockEdit,
    restricted: false,
    mostUsed: true,
    blockHasOwnFocusManagement: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };
  return config;
}
