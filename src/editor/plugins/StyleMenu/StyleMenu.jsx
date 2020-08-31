import React from 'react';
import { useSlate } from 'slate-react';
import Select, { components } from 'react-select';
import { settings } from '~/config';

import { isBlockActive, toggleBlock } from 'volto-slate/utils';

const brownColor = '#826A6A';

const selectStyles = {
  valueContainer: (provided, state) => {
    return {
      ...provided,
      paddingLeft: '0px',
      paddingTop: '0px',
      paddingRight: '0px',
      paddingDown: '0px',
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
    console.log('control state', state);
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
      width: '10rem',
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
};

const StylingsButton = (props) => {
  const editor = useSlate();

  const opts = settings.slate.styleMenuDefinitions;

  const [selectedStyle, setSelectedStyle] = React.useState(
    opts[opts.length - 1],
  );

  return (
    <div>
      <Select
        options={opts}
        value={selectedStyle}
        isMulti={true}
        styles={selectStyles}
        placeholder="No Style"
        components={{
          MultiValue: (props) => {
            // console.log('MultiValue props', props);
            return <>{props.children}</>;
          },
        }}
        theme={(theme) => {
          return {
            ...theme,
            colors: {
              ...theme.colors,
              primary: '#826A6AFF',
              primary75: '#826A6Abf',
              primary50: '#826A6A7f',
              primary25: '#826A6A40',
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
