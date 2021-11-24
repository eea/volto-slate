import React, { useMemo } from 'react';
import { useSelected, useFocused } from 'slate-react';

export const ImageElement = (props) => {
  const { attributes, element } = props;
  const selected = useSelected();
  const focused = useFocused();

  const style = useMemo(
    () => ({
      display: 'block',
      maxWidth: '100%',
      maxHeight: '20em',
      boxShadow: selected && focused ? '0 0 0 2px blue' : 'none',
    }),
    [selected, focused],
  );

  return (
    <p {...attributes}>
      <img alt="" src={element.url} style={style} />
    </p>
  );
};
