import installLinkPlugin from './Link';
import installBlockQuotePlugin from './Blockquote';
import installMarkdown from './Markdown';

export default function install(config) {
  return installLinkPlugin(installBlockQuotePlugin(installMarkdown(config)));
}
