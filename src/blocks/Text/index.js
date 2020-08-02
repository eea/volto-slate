import codeSVG from '@plone/volto/icons/code.svg';
import TextBlockView from './TextBlockView';
import TextBlockEdit from './TextBlockEdit';

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
} from './keyboard';
import { withDeleteSelectionOnEnter } from 'volto-slate/editor/extensions';
import {
  withInsertData,
  withSplitBlocksOnBreak,
  withDeserializers,
  breakList,
} from './extensions';
import { extractImages } from 'volto-slate/editor/plugins/Image/deconstruct';

export TextBlockView from './TextBlockView';
export TextBlockEdit from './TextBlockEdit';

export default (config) => {
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
        backspaceInList, // Backspace in list item lifts node and breaks Volto blocks
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

    // Used by deconstructToVoltoBlocks to transform tags such as <img> to a Volto image block
    // These emiters receive (editor, path), emit [blockid, blockoptions] and
    // are allowed to change the editor contents (for the given path)
    voltoBlockEmiters: [extractImages],

    ...config.settings.slate, // TODO: is this correct for volto-slate addons?
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

  return config;
};
