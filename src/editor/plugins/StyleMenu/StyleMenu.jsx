import React from 'react';
// import { useSlate } from 'slate-react';
import Select from 'react-select';

const brownColor = '#826A6A';

const opts = [
  { value: 'green-text', label: 'Green Text' },
  { value: 'no-styling', label: 'No Styling' },
];

const selectStyles = {
  valueContainer: (provided, state) => {
    return {
      ...provided,
      padding: '0 0 0 0',
    };
  },
  dropdownIndicator: (provided, state) => {
    return {
      ...provided,
      padding: '0 0 0 0',
    };
  },
  indicatorsContainer: (provided, state) => {
    return {
      ...provided,
      padding: '0 0 0 0',
    };
  },
  control: (provided, state) => {
    return {
      ...provided,
      minHeight: 'auto',
      borderWidth: 'unset',
      cursor: 'pointer',
    };
  },
  container: (provided, state) => {
    return {
      ...provided,
      marginLeft: '3px',
      backgroundColor: state.isFocused ? '#f3f3f3' : 'unset',
    };
  },
  singleValue: (provided, state) => {
    return {
      paddingLeft: '3px',
      fontSize: '1rem',
      color: brownColor,
    };
  },
  option: (provided, state) => {
    return {
      ...provided,
      fontSize: '1rem',
      color: brownColor,
    };
  },
};

const StylingsButton = (props) => {
  // const editor = useSlate();

  return (
    <div>
      <Select
        options={opts}
        value={opts[opts.length - 1]}
        defaultValue={opts[opts.length - 1]}
        isMulti={false}
        styles={selectStyles}
        onChange={({ value }) => {
          console.log('Selected:', value);
        }}
      ></Select>
    </div>
  );
};

export default StylingsButton;
