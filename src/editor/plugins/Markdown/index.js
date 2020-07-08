import { withAutoformat } from './extensions';
import { autoformatRules } from './constants';

export default function install(config) {
  const { slate } = config.settings;

  slate.extensions = [
    ...(slate.extensions || []),
    withAutoformat({ rules: autoformatRules }),
  ];

  return config;
}
