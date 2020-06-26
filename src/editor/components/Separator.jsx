import React from 'react';

// TODO: not showing up well (fitted & vertical, in position:relative parent):
// import { Divider } from 'semantic-ui-react';

const Separator = () => {
  return (
    <div
      style={{
        borderLeft: '0.1rem solid lightgray',
        width: '0.3rem',
      }}
    />
  );
};

export default Separator;
