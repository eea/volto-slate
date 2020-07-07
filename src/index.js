import codeSVG from '@plone/volto/icons/code.svg';

import { slate_block_selections } from './reducers';

import installVoltoProposals from './futurevolto/config';

import * as slateConfig from './editor/config';
import installDefaultPlugins from './editor/plugins';

import { TextBlockView, TextBlockEdit } from './TextBlock';
// import withDeserializeHtml from './TextBlock/extensions/withDeserializeHtml';
import {
  handleBackspaceInList,
  joinWithPreviousBlock,
  joinWithNextBlock,
  softBreak,
  goUp,
  goDown,
} from './TextBlock/keyboard';

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
    textblockExtensions: [], // withDeserializeHtml
    textblockKeyboardHandlers: {
      Backspace: [handleBackspaceInList, joinWithPreviousBlock],
      Delete: [joinWithNextBlock],
      Enter: [
        softBreak, // Handles shift+Enter as a newline (<br/>)
      ],
      ArrowUp: [goUp],
      ArrowDown: [goDown],
    },
    ...slateConfig,
  };

  installDefaultPlugins(config);
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
