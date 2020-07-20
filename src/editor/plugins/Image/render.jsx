import React from 'react';

export const ImageElement = ({ attributes, children, element }) => {
  console.log('image el', attributes, children, element);
  return <img {...attributes} src={element.src} alt="" />;
};
