import React from 'react';

export const LinkElement = (props) => {
  const { attributes, children, element } = props;
  // console.log('link', props);
  return (
    <span {...attributes} className="slate-editor-link">
      {Array.isArray(children)
        ? children.map((child) => {
            if (child?.props?.decorations) {
              const isSelection =
                child.props.decorations.findIndex((deco) => deco.isSelection) >
                -1;
              if (isSelection)
                return <span className="highlight-selection">{child}</span>;
            }
            return child;
          })
        : children}
    </span>
  );
};
