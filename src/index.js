import { TextBlockView, TextBlockEdit } from './TextBlock';
import codeSVG from '@plone/volto/icons/code.svg';
import * as slateConfig from './editor/config';

import installLinkPlugin from './editor/plugins/Link';
import installBlockQuotePlugin from './editor/plugins/BlockQuote';
import installVoltoProposals from './futurevolto/config';
import installMarkdown from './editor/plugins/Markdown';
// import installImagePlugin from './editor/plugins/Image';
import { slate_block_selections } from './reducers';

const applyConfig = (config) => {
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
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
    blockHasValue: (data) => {
      return !!data.plaintext;
    },
  };

  config.settings.defaultBlockType = 'slate';
  config.settings.slate = {
    ...slateConfig,
  };

  // installImagePlugin(config);
  installLinkPlugin(config);
  installMarkdown(config);
  installBlockQuotePlugin(config);
  installVoltoProposals(config);

  config.addonReducers = {
    ...config.addonReducers,
    slate_block_selections,
  };

  config.views = {
    ...config.views,
  };

  return config;
};

export default applyConfig;
