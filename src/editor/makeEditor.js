import { createEditor } from 'slate'; // , Transforms
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';

import config from '@plone/volto/registry';

export default function makeEditor() {
  const { slate } = config.settings;
  const defaultExtensions = slate.extensions;
  const raw = withHistory(withReact(createEditor()));

  // TODO: also look for MIME Types in the files case
  raw.dataTransferFormatsOrder = [
    'application/x-slate-fragment',
    'text/html',
    'files',
    'text/plain',
  ];
  raw.dataTransferHandlers = {};

  const plugins = [...defaultExtensions, ...this.props.extensions];
  const editor = plugins.reduce((acc, apply) => apply(acc), raw);

  return editor;
}
