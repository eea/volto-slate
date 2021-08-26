import * as slateConfig from './config';
import installDefaultPlugins from './plugins';
export SlateEditor, { EditorReference } from './SlateEditor';

export default (config) => {
  config.settings.slate = {
    ...slateConfig,
    // showExpandedToolbar: false,
    enableExpandedToolbar: false,
  };
  config = installDefaultPlugins(config);
  return config;
};
