import { withShortcuts } from './editorPlugins';

// TODO: this plugin seems to not work well
// (e.g. # and ## characters do not turn the block into a header)
export default function install(config) {
  const { slate } = config.settings;

  slate.editorPlugins = [...(slate.editorPlugins || []), withShortcuts];

  return config;
}
