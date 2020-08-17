import * as slateConfig from './config';
import installDefaultPlugins from './plugins';
export SlateEditor from './SlateEditor';

export default (config) => {
  config.settings.slate = {
    ...slateConfig,
  };
  config = installDefaultPlugins(config);
  return config;
};
