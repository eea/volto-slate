import React from 'react';
// import { useSelected, useFocused } from 'slate-react';

// className={css`
//   display: block;
//   max-width: 100%;
//   max-height: 20em;
//   box-shadow: ${selected && focused ? '0 0 0 2px blue;' : 'none'};
// `}

const ImageElement = ({ attributes, children, element }) => {
  // const selected = useSelected();
  // const focused = useFocused();
  return (
    <div {...attributes}>
      {children}
      <img alt="" src={element.url} />
    </div>
  );
};
export default ImageElement;
