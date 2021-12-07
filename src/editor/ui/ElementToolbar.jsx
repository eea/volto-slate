import { useSlate } from 'slate-react';
import { Portal } from 'react-portal';
import BasicToolbar from './BasicToolbar';
import React from 'react';
import { Editor } from 'slate';
import { ReactEditor } from 'slate-react';
import cx from 'classnames';

export const ElementToolbar = ({
  elementType,
  className,
  children,
  show = true,
}) => {
  const ref = React.useRef();
  const editor = useSlate();

  React.useEffect(() => {
    const el = ref.current;

    if ((children || []).length === 0) {
      el.removeAttribute('style');
      return;
    }

    if (!show) {
      el.removeAttribute('style');
      return;
    }

    const { selection } = editor;
    // const savedSelection = editor.getSavedSelection();
    if (!selection) {
      el.removeAttribute('style');
      return;
    }

    if (editor.isSidebarOpen) {
      el.removeAttribute('style');
      return;
    }

    const [element] = Editor.nodes(editor, {
      at: editor.selection || editor.getSavedSelection(),
      match: (n) => n.type === elementType,
    });

    if (!element) {
      el.removeAttribute('style');
      return;
    }

    const [n] = element;
    const domEl = ReactEditor.toDOMNode(editor, n);

    const rect = domEl.getBoundingClientRect();

    el.style.opacity = 1;
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight - 6}px`;
    el.style.left = `${Math.max(
      rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2,
      0, // if the left edge of the toolbar should be otherwise offscreen
    )}px`;
  });

  return (
    <Portal>
      <BasicToolbar className={cx('slate-inline-toolbar', className)} ref={ref}>
        {children}
      </BasicToolbar>
    </Portal>
  );
};
