import installBlockQuotePlugin from './Blockquote';
import installFootnote from './Footnote';
import installImage from './Image';
import installLinkPlugin from './Link';
import installMarkdown from './Markdown';
import installTable from './Table';
import installStyleMenu from './StyleMenu';

export default function install(config) {
  return [
    installBlockQuotePlugin,
    installLinkPlugin,
    installFootnote,
    installMarkdown,
    installImage,
    installTable,
    installStyleMenu,
  ].reduce((acc, apply) => apply(acc), config);
}
