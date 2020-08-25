import codeSVG from '@plone/volto/icons/code.svg';

import FootnotesBlockView from './FootnotesBlockView';
import FootnotesBlockEdit from './FootnotesBlockEdit';
import { FOOTNOTE } from 'volto-slate/constants';

/**
 * @summary Called from Volto to configure new or existing Volto block types.
 * @param {object} config The object received from Volto containing the
 * configuration for all the blocks.
 */
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

  config.settings.footnotes = [...(config.settings.footnotes || []), FOOTNOTE];
  return config;
}
