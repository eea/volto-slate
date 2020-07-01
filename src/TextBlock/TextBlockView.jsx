import React from 'react';
import serializeHTMLFromNodes from './serializeHTMLFromNodes';

const handleType = (tagName, html) => {
  html = html.replace(new RegExp('^<' + tagName + '>'), '');
  html = html.replace(new RegExp('</' + tagName + '>$'), '');
  return React.createElement(tagName, {
    dangerouslySetInnerHTML: { __html: html },
  });
};

const TextBlockView = ({ id, properties, data }) => {
  const { value } = data;
  const serializer = serializeHTMLFromNodes([]);
  let html = serializer(value);

  const blockType = value[0].type;

  let returnVal;

  // TODO: handle flexibly all other block types that a Slate block can contain
  switch (blockType) {
    case 'paragraph':
      returnVal = handleType('p', html);
      break;

    case 'numbered-list':
      returnVal = handleType('ol', html);
      break;

    case 'bulleted-list':
      returnVal = handleType('ul', html);
      break;

    case 'block-quote':
      returnVal = handleType('blockquote', html);
      break;

    case 'heading-two':
      returnVal = handleType('h2', html);
      break;

    case 'heading-three':
      returnVal = handleType('h3', html);
      break;

    default:
      console.warn(
        'Serializing a Slate block to HTML with unknown type:',
        blockType,
      );
      returnVal = <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return returnVal;
};

export default TextBlockView;
