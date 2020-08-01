import codeSVG from '@plone/volto/icons/code.svg';

import { slate_block_selections, upload_content } from './reducers';

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
import {
  withInsertData,
  withSplitBlocksOnBreak,
  withDeserializers,
  breakList,
} from './TextBlock/extensions';

import { TableEdit, TableView } from './Table';

const applyConfig = (config) => {
  config.blocks.blocksConfig.slateTable = {
    id: 'slateTable',
    title: 'Slate Table',
    icon: codeSVG,
    group: 'text',
    view: TableView,
    edit: TableEdit,
    restricted: false,
    mostUsed: true,
    blockHasOwnFocusManagement: true,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
    blockHasValue: (data) => {
      return true;
    },
  };

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
      // TODO: this should be handled better
      return !!data.plaintext;
    },
  };

  config.settings.defaultBlockType = 'slate';

  config.settings.slate = {
    // TODO: should we inverse order? First here gets executed last
    textblockExtensions: [
      withSplitBlocksOnBreak,
      withDeleteSelectionOnEnter,
      withDeserializers,
      withInsertData,
      breakList,
    ],

    // Pluggable handlers for the onKeyDown event of <Editable />
    // Order matters here. A handler can return `true` to stop executing any
    // following handler
    textblockKeyboardHandlers: {
      Backspace: [
        backspaceInList,
        joinWithPreviousBlock, // Backspace at beginning of block joins with previous block
      ],
      Delete: [
        joinWithNextBlock, // Delete at end of block joins with next block
      ],
      Enter: [
        softBreak, // Handles shift+Enter as a newline (<br/>)
      ],
      ArrowUp: [
        moveListItemUp, // Move down a list with with Ctrl+down
        goUp, // Select previous block
      ],
      ArrowDown: [
        moveListItemDown, // Move down a list item with Ctrl+down
        goDown, // Select next block
      ],
      Tab: [
        indentListItems, // <tab> and <c-tab> behaviour for list items
      ],
    },

    ...slateConfig, // TODO: is this correct for volto-slate addons?
  };

  installDefaultPlugins(config);
  installVoltoProposals(config);

  config.addonReducers = {
    ...config.addonReducers,
    slate_block_selections,
    upload_content,
  };

  config.views = {
    ...config.views,
  };

  return config;
};

export default applyConfig;
