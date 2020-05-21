import { TextBlockView, TextBlockEdit } from './TextBlock';
import codeSVG from '@plone/volto/icons/code.svg';
import * as slateConfig from './editor/config';

import installLinkPlugin from './editor/plugins/Link';
import installCalloutPlugin from './editor/plugins/Callout';
import installVoltoProposals from './futurevolto/config';
// import installMarkdown from './editor/plugins/Markdown';

export function applyConfig(config) {
  config.blocks.blocksConfig.slate = {
    id: 'slate',
    title: 'Slate',
    icon: codeSVG,
    group: 'text',
    view: TextBlockView,
    edit: TextBlockEdit,
    restricted: false,
    mostUsed: true,
    blockHasOwnFocusManagement: true,
    sidebarTab: 0,
    security: {
      addPermission: [],
      view: [],
    },
  };

  config.settings.slate = {
    ...slateConfig,
  };

  installLinkPlugin(config);
  // installMarkdown(config);
  installCalloutPlugin(config);
  installVoltoProposals(config);

  return config;
}
