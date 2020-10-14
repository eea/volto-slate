import { serializeNodes } from 'volto-slate/editor/render';

const TextBlockView = ({ id, properties, data, styling }) => {
  const { value } = data;
  let html = serializeNodes(value, id, styling);

  return html;
};

export default TextBlockView;
