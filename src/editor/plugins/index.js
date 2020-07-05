import installLinkPlugin from './Link';
import installBlockQuotePlugin from './Blockquote';
import installMarkdown from './Markdown';
import installFootnote from './Footnote';

export default function install(config) {
  return [
    installBlockQuotePlugin,
    installLinkPlugin,
    installFootnote,
    installMarkdown,
  ].reduce((acc, apply) => apply(acc), config);
}
