import { SidebarPortal } from '@plone/volto/components';
import React from 'react';
import FootList from 'volto-slate/futurevolto/FootList';
import FootnotesBlockView from './FootnotesBlockView';
// import AccordionWidget from 'volto-slate/futurevolto/AccordionWidget';

const FootnotesBlockEdit = (props) => {
  const { selected, block, data, onChangeBlock } = props;

  console.log(props);

  return (
    <>
      <FootnotesBlockView {...props} />
      <SidebarPortal selected={selected}>
        {/* <InlineForm
          schema={schema}
          title={schema.title}
          onChangeField={(id, value) => {
            onChangeBlock(block, {
              ...data,
              [id]: value,
            });
          }}
          formData={data}
        /> */}
        {/* <AccordionWidget /> */}
        <FootList />
      </SidebarPortal>
    </>
  );
};

export default FootnotesBlockEdit;
