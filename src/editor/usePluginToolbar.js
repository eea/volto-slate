import { isEqual } from 'lodash';
import React from 'react';

export default (editor, isActiveElement, getActiveElement, PluginToolbar) => {
  const isActive = isActiveElement(editor);
  const elementRef = React.useRef(null);
  const element = getActiveElement(editor);

  const { setPluginToolbar } = editor;

  React.useEffect(() => {
    if (isActive && !isEqual(element, elementRef.current)) {
      elementRef.current = element;
      if (elementRef.current) {
        setPluginToolbar(PluginToolbar);
      }
    } else if (!isActive) {
      elementRef.current = null;
      setPluginToolbar(null);
    }
  }, [PluginToolbar, element, isActive, setPluginToolbar]);
};
