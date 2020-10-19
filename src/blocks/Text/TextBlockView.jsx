import { serializeNodes } from 'volto-slate/editor/render';
import { settings } from '~/config';

const TextBlockView = (props) => {
  const { id, data, styling = {} } = props;
  const { value, override_toc } = data;
  return serializeNodes(value, (node, path) => {
    const res = { ...styling };
    if (node.type) {
      if (
        settings.slate.topLevelTargetElements.includes(node.type) ||
        override_toc
      ) {
        res.id = id;
      }
    }
    return res;
  });
};

export default TextBlockView;
