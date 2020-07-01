import React from 'react';
import { useSlate } from 'slate-react';
import { Transforms } from 'slate';
import ToolbarButton from '../../components/ToolbarButton';
import { isLinkActive, insertLink, unwrapLink } from './utils';

import linkSVG from '@plone/volto/icons/link.svg';
import unlinkSVG from '@plone/volto/icons/unlink.svg';
import { ModalForm } from '@plone/volto/components';
import LinkEditSchema from './schema';

// TODO: reset fields in form when opening the form again

const LinkButton = () => {
  const editor = useSlate();
  const [showForm, setShowForm] = React.useState(false);
  const [selection, setSelection] = React.useState(null);
  const [data] = React.useState({});

  const ila = isLinkActive(editor);

  const submitHandler = React.useCallback(
    (formData) => {
      // TODO: have an algorithm that decides which one is used
      const url = formData?.link?.external_link;
      const data = { ...formData };
      if (url) {
        Transforms.select(editor, selection);
        insertLink(editor, url, data);
      } else {
        unwrapLink(editor);
      }
      setShowForm(false);
    },
    [editor, selection],
  );

  return (
    <>
      <ModalForm
        open={showForm}
        schema={LinkEditSchema}
        title="Insert link"
        formData={data}
        submitLabel="Insert"
        loading={false}
        onSubmit={submitHandler}
        onCancel={() => setShowForm(false)}
      />
      <ToolbarButton
        active={ila}
        onMouseDown={() => {
          if (
            ila &&
            // TODO: remove this confirm
            // eslint-disable-next-line no-alert
            window.confirm('Are you sure that you want to remove the link?')
          ) {
            unwrapLink(editor);
            return;
          }

          if (!showForm) {
            setSelection(editor.selection);
            setShowForm(true);
          }
        }}
        icon={ila ? unlinkSVG : linkSVG}
      />
    </>
  );
};

export default LinkButton;
