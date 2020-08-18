import React from 'react';
import { Field, Icon } from '@plone/volto/components';
import { Accordion } from 'semantic-ui-react';

import upSVG from '@plone/volto/icons/up-key.svg';
import downSVG from '@plone/volto/icons/down-key.svg';

// TODO: use the latest version of ObjectWidget here (or in future maybe import it from Volto):
// https://github.com/plone/volto/pull/1566

const Object = ({ schema, value, onChange, errors = {}, id, ...props }) => {
  const renderFieldSet = React.useCallback(
    (fieldset) => {
      return fieldset.fields.map((field, index) => {
        return (
          <Field
            {...schema.properties[field]}
            id={field}
            fieldset={fieldset.title.toLowerCase()}
            focus={index === 0}
            value={value?.[field]}
            required={schema.required.indexOf(field) !== -1}
            onChange={(field, fieldvalue) => {
              return onChange(id, { ...value, [field]: fieldvalue });
            }}
            key={field}
            error={errors[field]}
          />
        );
      });
    },
    [errors, onChange, schema, value, id],
  );

  const [activeIndex, setActiveAccordionIndex] = React.useState(0);

  function handleAccordionClick(e, titleProps) {
    const { index } = titleProps;
    const newIndex = activeIndex === index ? -1 : index;

    setActiveAccordionIndex(newIndex);
  }

  return schema.fieldsets.length === 1 ? (
    renderFieldSet(schema.fieldsets[0])
  ) : (
    <Accordion fluid styled>
      {schema.fieldsets.map((fieldset, index) => {
        return (
          <React.Fragment>
            <Accordion.Title
              active={activeIndex === index}
              index={index}
              onClick={handleAccordionClick}
            >
              {fieldset.title}
              {activeIndex === index ? (
                <Icon name={upSVG} size="20px" />
              ) : (
                <Icon name={downSVG} size="20px" />
              )}
            </Accordion.Title>
            <Accordion.Content
              active={activeIndex === index}
            >
              <div style={{ padding: '1em 0' }}>
                {renderFieldSet(fieldset)}
              </div>
            </Accordion.Content>
          </React.Fragment>
        );
      })}
    </Accordion>
  );
};

export default Object;
