// TODO: we could decorate the editor with these methods, instead of having
// the here separate.

import codeSVG from '@plone/volto/icons/code.svg';

import { slate_block_selections } from './reducers';

import installVoltoProposals from './futurevolto/config';

import * as slateConfig from './editor/config';
import installDefaultPlugins from './editor/plugins';

import { TextBlockView, TextBlockEdit } from './TextBlock';
import {
  goDown,
  goUp,
  backspaceInList,
  indentListItems,
  joinWithNextBlock,
  joinWithPreviousBlock,
  softBreak,
  moveListItemDown,
  moveListItemUp,
} from './TextBlock/keyboard';
import { withDeleteSelectionOnEnter } from './editor/extensions';
import { withSplitBlocksOnBreak } from './TextBlock/extensions';

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
    // TODO: should we inverse order? First here gets executed last
    textblockExtensions: [withSplitBlocksOnBreak, withDeleteSelectionOnEnter], // withDeserializeHtml

    // Pluggable handlers for the onKeyDown event of <Editable />
    // Order matters here. A handler can return `true` to stop executing any
    // following handler
    textblockKeyboardHandlers: {
      Backspace: [
        backspaceInList,
        joinWithPreviousBlock, // join with previous block
      ],
      Delete: [
        joinWithNextBlock, // join with next block
      ],
      Enter: [
        softBreak, // Handles shift+Enter as a newline (<br/>)
      ],
      ArrowUp: [moveListItemUp, goUp], // Move up to previous block
      ArrowDown: [moveListItemDown, goDown], // Move down to next block
      Tab: [indentListItems],
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
