import React from 'react';
import { useSlate } from 'slate-react';
import Button from './../../components/Button';
import { isLinkActive, insertLink, unwrapLink } from './utils';

import linkSVG from '@plone/volto/icons/link.svg';
import unlinkSVG from '@plone/volto/icons/unlink.svg';
import { ModalForm } from '@plone/volto/components';
import LinkEditSchema from './schema';

const LinkButton = () => {
  const editor = useSlate();
  const [showForm, setShowForm] = React.useState(false);
  const [selection, setSelection] = React.useState(null);
  const [data, setData] = React.useState({});

  const ila = isLinkActive(editor);

  return (
    <>
      <ModalForm
        open={showForm}
        schema={LinkEditSchema}
        title="Insert link"
        formData={data}
        submitLabel="Insert"
        loading={false}
        onSubmit={(formData) => {
          // have an algorithm that decides which one is used
          const url = formData?.link?.external_link;
          const data = { ...formData };
          editor.selection = selection;
          if (url) insertLink(editor, url, data);
          setShowForm(false);
        }}
        onCancel={() => setShowForm(false)}
      />
      <Button
        active={ila}
        onMouseDown={(event) => {
          setSelection(editor.selection);
          if (!showForm) {
            setShowForm(true);
          }
        }}
        icon={ila ? unlinkSVG : linkSVG}
      />
    </>
  );
};

export default LinkButton;

//onMouseDown={(event) => {
//  event.preventDefault();

//  if (
//    ila &&
//    window.confirm('Are you sure that you want to remove the link?')
//  ) {
//    unwrapLink(editor);
//    return;
//  }

//  const url = window.prompt('Enter the URL of the link:');
//  if (!url) {
//    return;
//  }
//  insertLink(editor, url);
//}}
