import { createEditor } from 'slate'; // , Transforms
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';

import config from '@plone/volto/registry';

export default function makeEditor(options = {}) {
  const { extensions = [] } = options;
  const { slate } = config.settings;
  const defaultExtensions = slate.extensions;
  const editor = withHistory(withReact(createEditor()));

  // TODO: also look for MIME Types in the files case
  editor.dataTransferFormatsOrder = [
    'application/x-slate-fragment',
    'text/html',
    'files',
    'text/plain',
  ];
  editor.dataTransferHandlers = {};

  const plugins = [...defaultExtensions, ...extensions];

  return plugins.reduce((acc, extender) => extender(acc), editor);
}
