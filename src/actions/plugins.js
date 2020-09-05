import { SLATE_PLUGINS } from 'volto-slate/constants';

export function setPluginOption(pluginId, values = {}) {
  return {
    type: SLATE_PLUGINS,
    pluginId,
    values,
  };
}
