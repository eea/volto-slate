import React from 'react';
import { useSlate } from 'slate-react';
import { Editor } from 'slate';
import Select, { components } from 'react-select';
import { useIntl, defineMessages } from 'react-intl';
import { settings } from '~/config';
import {
  toggleBlockStyle,
  isBlockStyleActive,
  toggleInlineStyle,
  isInlineStyleActive,
} from '../../../utils/blocks';

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
  group: (provided, state) => {
    return {
      ...provided,
      fontSize: '1rem',
    };
  },
};

const StylingsButton = (props) => {
  const editor = useSlate();
  const intl = useIntl();

  // Converting the settings to a format that is required by react-select.
  const rawOpts = settings.slate.styleMenuDefinitions.map((def) => {
    return { value: def.cssClass, label: def.label, isBlock: def.isBlock };
  });

  const opts = [
    {
      label: 'For blocks',
      options: rawOpts.filter((x) => x.isBlock),
    },
    {
      label: 'For inlines',
      options: rawOpts.filter((x) => !x.isBlock),
    },
  ];

  // Calculating the initial selection.
  const toSelect = [];
  // block styles
  for (const val of opts[0].options) {
    const ia = isBlockStyleActive(editor, val.value);
    if (ia) {
      toSelect.push(val);
    }
  }
  // inline styles
  for (const val of opts[1].options) {
    const ia = isInlineStyleActive(editor, val.value);
    if (ia) {
      toSelect.push(val);
    }
  }

  return (
    <div>
      <Select
        options={opts}
        value={toSelect}
        isMulti={true}
        styles={selectStyles}
        placeholder="No Style"
        hideSelectedOptions={false}
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
        onChange={(selItem, meta) => {
          // console.log('meta', meta);

          for (const item of rawOpts) {
            const isRequested = selItem.includes(item);
            const isActive =
              isBlockStyleActive(editor, item.value) ||
              isInlineStyleActive(editor, item.value);

            if (isRequested && isActive) {
              // nothing to do
            } else if (isRequested && !isActive) {
              if (item.isBlock && !isBlockStyleActive(editor, item.value)) {
                toggleBlockStyle(editor, item.value);
              } else if (
                !item.isBlock &&
                !isInlineStyleActive(editor, item.value)
              ) {
                toggleInlineStyle(editor, item.value);
              }
            } else if (!isRequested && isActive) {
              if (item.isBlock && !isBlockStyleActive(editor, item.value)) {
                toggleBlockStyle(editor, item.value);
              } else if (
                !item.isBlock &&
                !isInlineStyleActive(editor, item.value)
              ) {
                toggleInlineStyle(editor, item.value);
              }
            } else if (!isRequested && !isActive) {
              // nothing to do
            }
          }
        }}
      ></Select>
    </div>
  );
};

export default StylingsButton;
