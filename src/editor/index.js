import * as slateConfig from './config';
import installDefaultPlugins from './plugins';
export SlateEditor from './SlateEditor';

export default (config) => {
  config.settings.slate = {
    ...slateConfig,
    showToolbar: false,
  };
  config = installDefaultPlugins(config);
  return config;
};
