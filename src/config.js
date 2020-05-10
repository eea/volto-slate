import { TextBlockView, TextBlockEdit } from './TextBlock';
import codeSVG from '@plone/volto/icons/code.svg';
import uglyIcon from '@plone/volto/icons/frustrated.svg';

function exampleConfig(config) {
  return config;
}

export function applyConfig(config) {
  config.blocks.blocksConfig.slate = {
    id: 'slate',
    title: 'Slate',
    icon: codeSVG,
    group: 'text',
    view: TextBlockView,
    edit: TextBlockEdit,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };
  return exampleConfig(config);
}
