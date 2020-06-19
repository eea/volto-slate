import React from 'react';
import serializeHTMLFromNodes from './serializeHTMLFromNodes';

const handleType = (tagName, html) => {
  html = html.replace(new RegExp('^<' + tagName + '>'), '');
  html = html.replace(new RegExp('<\\' + tagName + '>$'), '');
  return React.createElement(tagName, {
    dangerouslySetInnerHTML: { __html: html },
  });
};

const TextBlockView = ({ id, properties, data }) => {
  const { value } = data;
  const serializer = serializeHTMLFromNodes([]);
  let html = serializer(value);

  const blockType = value[0].type;

  // TODO: handle flexibly all other block types that a Slate block can contain
  switch (blockType) {
    case 'paragraph':
      return handleType('p', html);

    case 'numbered-list':
      return handleType('ol', html);

    case 'bulleted-list':
      return handleType('ul', html);

    case 'block-quote':
      return handleType('blockquote', html);

    case 'heading-two':
      return handleType('h2', html);

    case 'heading-three':
      return handleType('h3', html);

    default:
      console.warn(
        'Serializing a Slate block to HTML with unknown type:',
        blockType,
      );
      return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }
};

export default TextBlockView;
