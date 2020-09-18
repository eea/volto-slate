import React from 'react';
import { Menu, Tab } from 'semantic-ui-react';
import { Field, Icon } from '@plone/volto/components';
import { ObjectWidget } from '@eeacms/volto-object-widget/Widget';

// const FieldSet = ({ data, index, schema, value, errors, onChange, id }) => {
//   return (
//     data.fields?.map((field, idx) => {
//       const v = value?.[field] || schema.properties[field].defaultValue;
//       return (
//         <Field
//           {...schema.properties[field]}
//           id={`${field}-${idx}-${id}`}
//           fieldset={data.title.toLowerCase()}
//           value={v}
//           required={schema.required.indexOf(field) !== -1}
//           onChange={(field2, fieldvalue) => {
//             return onChange(id, { ...value, [field]: fieldvalue });
//           }}
//           key={field}
//           error={errors?.[field]}
//           title={schema.properties[field].title}
//         />
//       );
//     }) || 'nothing'
//   );
// };

export const ObjectByTypeWidget = (props) => {
  const {
    schemas,
    value = {}, // not checked to not contain unknown fields
    onChange,
    errors = {},
    id,
  } = props;
  const objectId = id;
  // console.log('props', props);

  const [activeTab, setActiveTab] = React.useState(0);
  const createTab = ({ schema, id, icon }, index) => {
    return {
      menuItem: () => (
        <Menu.Item onClick={() => setActiveTab(index)}>
          <Icon size="24px" name={icon} title={schema.title} />
        </Menu.Item>
      ),
      render: () => {
        // console.log('value', value, id, value[id]);
        return (
          <Tab.Pane>
            <ObjectWidget
              schema={schema}
              id={id}
              errors={errors}
              value={value[id] || {}}
              onChange={(schemaId, v) => {
                onChange(objectId, { [schemaId]: v });
              }}
            />
          </Tab.Pane>
        );
      },
    };
  };

  return <Tab panes={schemas.map(createTab)} activeIndex={activeTab} />;
};

export default ObjectByTypeWidget;
