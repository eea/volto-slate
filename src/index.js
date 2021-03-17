import * as slateReducers from './reducers';

import installSlate from './editor';
import installTextBlock from './blocks/Text';
import installTableBlock from './blocks/Table';
import installVoltoProposals from './futurevolto';
import RichTextWidget from './widgets/RichTextWidget';
import { BlocksBrowserWidget } from './widgets/BlocksBrowser';
import HashLink from './editor/plugins/Link/AppExtras/HashLink';

export default (config) => {
  config = [
    installSlate,
    installTextBlock,
    installTableBlock,
    installVoltoProposals,
  ].reduce((acc, apply) => apply(acc), config);

  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    {
      match: '',
      component: HashLink,
    },
  ];

  config.addonReducers = {
    ...config.addonReducers,
    ...slateReducers,
  };

  config.views = {
    ...config.views,
  };

  config.widgets.widget.slate_richtext = RichTextWidget;
  config.widgets.widget.blocks_browser = BlocksBrowserWidget;

  return config;
};

export function asDefault(config) {
  config.settings.defaultBlockType = 'slate';

  config.blocks.blocksConfig.slateTable.title = 'Table';
  config.blocks.blocksConfig.slate.title = 'Text';

  config.blocks.blocksConfig.text.restricted = true;
  config.blocks.blocksConfig.table.restricted = true;

  // TODO: handle title and description blocks
  return config;
}
