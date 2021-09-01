import installBlockQuotePlugin from './Blockquote';
import installImage from './Image';
import installLinkPlugin from './Link';
import installMarkdown from './Markdown';
import installStyleMenu from './StyleMenu';

export default function install(config) {
  return [
    installBlockQuotePlugin,
    installLinkPlugin,
    installMarkdown,
    installImage,
    installStyleMenu,
  ].reduce((acc, apply) => apply(acc), config);
}
