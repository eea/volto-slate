import React from 'react';
import SlateEditorContext from './SlateEditorContext';
import { useSelected } from 'slate-react';

export default function SlateEditorContextSetter(props) {
  const sel = useSelected();
  const ctx = React.useContext(SlateEditorContext);
  ctx.focused = sel;

  return <SlateEditorContext.Consumer />;
}
