import React from 'react';
import { Node } from 'slate';
import { settings } from '~/config';
// import { useSelected, useFocused } from 'slate-react';

export const Element = (props) => {
  const { attributes, children, element } = props;
  const AddonEl = settings?.slate?.elements?.[element.type];

  // const selected = useSelected();
  // const focused = useFocused();

  if (AddonEl) {
    return <AddonEl {...props} />;
  }

  switch (element.type) {
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>;
    // case 'image':
    //   const type = attributes['data-slate-type'];
    //   delete attributes['data-slate-type'];

    //   return (
    //     // <div {...attributes}>
    //     <div {...attributes} contentEditable={false}>
    //       <img
    //         data-slate-type={type}
    //         src={element.url}
    //         alt=""
    //         style={{
    //           display: 'block',
    //           maxWidth: '100%',
    //           maxHeight: '20em',
    //           padding: '10px 0',
    //           boxShadow: selected && focused ? '0 0 0 3px #B4D5FF' : 'none',
    //         }}
    //       />
    //     </div>
    //     // {/* {children} */}
    //     // </div>
    //   );
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export const Leaf = ({ attributes, leaf, children }) => {
  let [leafs, availableLeafs] = [
    settings?.slate?.leafs,
    settings?.slate?.availableLeafs,
  ];

  children = leafs?.reduce((acc, name) => {
    return leaf[name] ? availableLeafs[name]({ children: acc }) : acc;
  }, children);

  return <span {...attributes}>{children}</span>;
};

export const plaintext_serialize = (nodes) => {
  return nodes.map((n) => Node.string(n)).join('\n');
};
