import { withShortcuts } from './decorators';

// TODO: this plugin seems to not work well
export default function install(config) {
  const slate = config.settings.slate || {};
  config.settings.slate = slate;

  slate.decorators = [...(slate.decorators || []), withShortcuts];

  return config;
}
