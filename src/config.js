import { TextBlockView, TextBlockEdit } from './TextBlock';
import codeSVG from '@plone/volto/icons/code.svg';
import * as slateConfig from './editor/config';
// import installLinkPlugin from './editor/plugins/Link';
//import uglyIcon from '@plone/volto/icons/frustrated.svg';

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

  config.settings.slate = {
    ...slateConfig,
  };

  return config;
}
