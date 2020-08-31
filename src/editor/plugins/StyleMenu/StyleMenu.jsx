import React from 'react';
import { useSlate } from 'slate-react';
import Select, { components } from 'react-select';
import { useIntl, defineMessages } from 'react-intl';
import { settings } from '~/config';
import { isBlockActive, toggleBlock } from 'volto-slate/utils';

const messages = defineMessages({
  allStylesApplied: {
    id: 'All Styles Applied',
    defaultMessage: 'All Styles Applied',
  },
});

const brownColor = '#826A6A';

const selectStyles = {
  valueContainer: (provided, state) => {
    return {
      ...provided,
      paddingLeft: '0px',
      paddingTop: '0px',
      paddingRight: '0px',
      paddingDown: '0px',
      fontSize: '1rem',
      position: 'static',
    };
  },
  input: (provided, state) => {
    return {
      ...provided,
      display: 'none',
    };
  },
  dropdownIndicator: (provided, state) => {
    return {
      ...provided,
      paddingLeft: '0px',
      paddingTop: '0px',
      paddingRight: '0px',
      paddingDown: '0px',
    };
  },
  indicatorsContainer: (provided, state) => {
    return {
      ...provided,
      padding: '0px',
      paddingLeft: '0px',
      paddingTop: '0px',
      paddingRight: '0px',
      paddingDown: '0px',
    };
  },
  control: (provided, state) => {
    return {
      ...provided,
      minHeight: 'auto',
      borderWidth: 'unset',
      cursor: 'pointer',
      // borderColor: state.isFocused ? brownColor : '#f3f3f3',
      // boxShadow: 'unset',
    };
  },
  container: (provided, state) => {
    return {
      ...provided,
      marginLeft: '3px',
      width: '15rem',
      // backgroundColor: state.isFocused ? '#f3f3f3' : 'unset',
    };
  },
  singleValue: (provided, state) => {
    return {
      paddingLeft: '3px',
      fontSize: '1rem',
      // color: brownColor,
    };
  },
  option: (provided, state) => {
    return {
      ...provided,
      fontSize: '1rem',
      cursor: 'pointer',
      // color: state.isSelected ? 'white' : brownColor,
    };
  },
  noOptionsMessage: (provided, state) => {
    return {
      ...provided,
      fontSize: '1rem',
    };
  },
};

const StylingsButton = (props) => {
  const editor = useSlate();
  const intl = useIntl();

  const opts = settings.slate.styleMenuDefinitions.map((def) => {
    return { value: def.cssClass, label: def.label };
  });

  const [selectedStyle, setSelectedStyle] = React.useState(null);

  return (
    <div>
      <Select
        options={opts}
        value={selectedStyle}
        isMulti={true}
        styles={selectStyles}
        placeholder="No Style"
        noOptionsMessage={({ inputValue }) =>
          intl.formatMessage(messages.allStylesApplied)
        }
        components={{
          // Shows the most relevant part of the selection as a simple string of text.
          MultiValue: (props) => {
            const val = props.getValue();

            if (props.index === 0) {
              const cond = val.length > 1;
              const lbl = val[props.index].label + '...';
              const lbl2 = val[props.index].label;
              return <>{cond ? lbl : lbl2}</>;
            }

            return '';
          },
        }}
        theme={(theme) => {
          return {
            ...theme,
            colors: {
              ...theme.colors,
              primary: '#826A6AFF', // 100% opaque @brown
              primary75: '#826A6Abf', // 75% opaque @brown
              primary50: '#826A6A7f', // 50% opaque @brown
              primary25: '#826A6A40', // 25% opaque @brown
            },
          };
        }}
        onChange={(selItem) => {
          setSelectedStyle(selItem);
          // toggleBlock(editor, 'style');
        }}
      ></Select>
    </div>
  );
};

export default StylingsButton;
