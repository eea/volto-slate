import React from 'react';
import Toolbar from './Toolbar';

export default ({ editor, plugins }) => {
  const components = plugins.map((plug) => plug(editor)).filter((c) => !!c);
  return components.length ? <Toolbar>{components}</Toolbar> : '';
};
