import React from 'react';
import FootnotesBlockView from './FootnotesBlockView';
import InlineForm from 'volto-slate/futurevolto/InlineForm';
import { FootnoteBlockSchema as schema } from './schema';
import { SidebarPortal } from '@plone/volto/components';

const FootnotesBlockEdit = (props) => {
  const { selected, block, data, onChangeBlock } = props;
  return (
    <>
      <FootnotesBlockView {...props} />
      <SidebarPortal selected={selected}>
        <InlineForm
          schema={schema}
          title={schema.title}
          onChangeField={(id, value) => {
            onChangeBlock(block, {
              ...data,
              [id]: value,
            });
          }}
          formData={data}
        />
      </SidebarPortal>
    </>
  );
};

export default FootnotesBlockEdit;
