import { serializeNodes } from 'volto-slate/editor/render';

const TextBlockView = ({ id, properties, data }) => {
  const { value } = data;
  let html = serializeNodes(value);

  return html;
};

export default TextBlockView;
