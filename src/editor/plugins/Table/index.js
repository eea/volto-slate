import { withTable } from './extensions';
import { tableElements } from './render';

export default function install(config) {
  const { slate } = config.settings;

  slate.extensions = [...(slate.extensions || []), withTable];
  slate.elements = {
    ...slate.elements,
    ...tableElements,
  };
  return config;
}
