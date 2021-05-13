import installBlockQuotePlugin from './Blockquote';
import installImage from './Image';
import installLinkPlugin from './Link';
import installMarkdown from './Markdown';
import installTable from './Table';
import installStyleMenu from './StyleMenu';
import installSimpleLink from './SimpleLink';

export default function install(config) {
  return [
    installBlockQuotePlugin,
    installLinkPlugin,
    installMarkdown,
    installImage,
    installTable,
    installStyleMenu,
    installSimpleLink,
  ].reduce((acc, apply) => apply(acc), config);
}
