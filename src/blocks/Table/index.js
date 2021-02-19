import codeSVG from '@plone/volto/icons/code.svg';
import TableEdit from './Edit';
import TableView from './View';
import { extractTables } from './deconstruct';

/**
 * @summary Called from Volto to configure new or existing Volto block types.
 * @param {object} config The object received from Volto containing the
 * configuration for all the blocks.
 */
export default function install(config) {
  config.settings.slate = {
    ...config.settings.slate,
    voltoBlockEmiters: [
      ...(config.settings.slate.voltoBlockEmiters || []),
      extractTables,
    ],
  };
  config.blocks.blocksConfig.slateTable = {
    id: 'slateTable',
    title: 'Table',
    icon: codeSVG,
    group: 'text',
    view: TableView,
    edit: TableEdit,
    restricted: false,
    mostUsed: false,
    blockHasOwnFocusManagement: true,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
    // blockHasValue: (data) => {
    //   return true;
    // },
  };
  return config;
}
