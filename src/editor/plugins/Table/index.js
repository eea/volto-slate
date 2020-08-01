import { withTablePaste } from './extensions';

export default function install(config) {
  const { slate } = config.settings;

  slate.extensions = [...(slate.extensions || []), withTablePaste];
  return config;
}
