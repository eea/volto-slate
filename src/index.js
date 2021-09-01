import * as slateReducers from './reducers';

import installSlate from './editor';
import installTextBlock from './blocks/Text';
import installTableBlock from './blocks/Table';
import installVoltoProposals from './futurevolto';
import RichTextWidget from './widgets/RichTextWidget';
import { BlocksBrowserWidget } from './widgets/BlocksBrowser';
import HashLink from './editor/plugins/Link/AppExtras/HashLink';
import installCallout from './editor/plugins/Callout';
import installTable from './editor/plugins/Table';
import installSimpleLink from './editor/plugins/SimpleLink';

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

  config.widgets.widget.blocks_browser = BlocksBrowserWidget;
  config.widgets.widget.slate = RichTextWidget;
  config.widgets.widget.slate_richtext = RichTextWidget; // BBB

  return config;
};

export function minimalDefault(config) {
  config = asDefault(config);
  config.settings.slate.toolbarButtons = [
    'bold',
    'italic',
    'link',
    'separator',
    'heading-two',
    'heading-three',
    'numbered-list',
    'bulleted-list',
    'blockquote',
  ];

  installCallout(config);

  return config;
}

export function simpleLink(config) {
  return installSimpleLink(config);
}

export function tableButton(config) {
  return installTable(config);
}

export function asDefault(config) {
  config.settings.defaultBlockType = 'slate';

  config.blocks.blocksConfig.slateTable.title = 'Table';
  config.blocks.blocksConfig.slate.title = 'Text';

  config.blocks.blocksConfig.text.restricted = true;
  config.blocks.blocksConfig.table.restricted = true;

  // TODO: handle title and description blocks
  return config;
}
