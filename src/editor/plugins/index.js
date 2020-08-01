import installBlockQuotePlugin from './Blockquote';
import installFootnote from './Footnote';
import installImage from './Image';
import installLinkPlugin from './Link';
import installMarkdown from './Markdown';
import installTablePaste from './TablePaste';

export default function install(config) {
  return [
    installBlockQuotePlugin,
    installLinkPlugin,
    installFootnote,
    installMarkdown,
    installImage,
    installTablePaste,
  ].reduce((acc, apply) => apply(acc), config);
}
