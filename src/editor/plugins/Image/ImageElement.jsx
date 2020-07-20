import React from 'react';
import { useSelected, useFocused } from 'slate-react';

const ImageElement = (props) => {
  const { attributes, children, element } = props;
  const selected = useSelected();
  const focused = useFocused();
  console.log('image element', props);
  const style = {
    display: 'block',
    'max-width': '100%',
    'max-height': '20em',
    'box-shadow': `${selected && focused ? '0 0 0 2px blue;' : 'none'}`,
  };

  return (
    <div {...attributes}>
      {children}
      <img alt="" src={element.src} style={style} />
    </div>
  );
};
export default ImageElement;
