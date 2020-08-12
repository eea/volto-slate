import { slate_block_selections, upload_content } from './reducers';

import installSlate from './editor';
import installTextBlock from './blocks/Text';
import installTableBlock from './blocks/Table';
import installFootnoteBlock from './blocks/Footnote';
import installTitleBlock from './blocks/Title';
import installDescriptionBlock from './blocks/Description';
import installVoltoProposals from './futurevolto';

export default (config) => {
  config = [
    installSlate,
    installTextBlock,
    installTableBlock,
    installFootnoteBlock,
    installTitleBlock,
    installDescriptionBlock,
    installVoltoProposals,
  ].reduce((acc, apply) => apply(acc), config);

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

export function asDefault(config) {
  config.settings.defaultBlockType = 'slate';

  config.blocks.blocksConfig.text.restricted = true;
  config.blocks.blocksConfig.table.restricted = true;

  // TODO: handle title and description blocks
  return config;
}
