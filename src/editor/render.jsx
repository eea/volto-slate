import React from 'react';
import { Node } from 'slate';
import { settings } from '~/config';

export const Element = (props) => {
  const { element } = props; // attributes, children,
  const { elementRenderers } = settings.slate;
  const AddonEl = elementRenderers[element.type] || elementRenderers['default'];

  return <AddonEl {...props} />;
};

export const Leaf = ({ attributes, leaf, children }) => {
  let { leafTypes = [], leafRenderers = {} } = settings || {};

  children = leafTypes.reduce((acc, name) => {
    return leaf[name] ? leafRenderers[name]({ children: acc }) : acc;
  }, children);

  return <span {...attributes}>{children}</span>;
};

export const plaintext_serialize = (nodes) => {
  return nodes.map((n) => Node.string(n)).join('\n');
};

// import { useSelected, useFocused } from 'slate-react';
// const selected = useSelected();
// const focused = useFocused();
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
