import React from 'react';
import { htmlTagsToSlate } from 'volto-slate/editor/config';

const withTestingFeatures = (WrappedComponent) => {
  return (props) => {
    const ref = React.useRef();
    const [pleaseRerender, setPleaseRerender] = React.useState(false);

    // Source: https://stackoverflow.com/a/53623568/258462
    const onTestSelectWord = (val) => {
      let slateEditor =
        val.detail.parentElement.parentElement.parentElement.parentElement;

      // Events are special, can't use spread or Object.keys
      let selectEvent = {};
      for (let key in val) {
        if (key === 'currentTarget') {
          selectEvent['currentTarget'] = slateEditor;
        } else if (key === 'type') {
          selectEvent['type'] = 'select';
        } else {
          selectEvent[key] = val[key];
        }
      }

      // Make selection
      let selection = window.getSelection();
      let range = document.createRange();
      range.selectNodeContents(val.detail);
      selection.removeAllRanges();
      selection.addRange(range);

      // Slate monitors DOM selection changes automatically
    };

    React.useEffect(() => {
      document.addEventListener('Test_SelectWord', onTestSelectWord);

      return () => {
        document.removeEventListener('Test_SelectWord', onTestSelectWord);
      };
    });

    React.useEffect(() => {
      return () => {
        ref.current = null;
      };
    });

    return (
      <WrappedComponent
        debug-values={{
          'data-slate-value': JSON.stringify(props.value, null, 2),
          'data-slate-selection': JSON.stringify(
            ref?.current?.selection,
            null,
            2,
          ),
        }}
        testingEditorRef={(val) => {
          // console.log('testingEditorRef called', val);

          // TODO: rerandează aici cu useState!

          // Jest (JSDOM) environment
          // console.log('in jest? ', __JEST__);
          ref.current = val;
          if (val && global.__JEST__) {
            // for Jest (JSDOM) unit tests that should have access to a reasonable set
            // of htmlTagsToSlate default value
            val.htmlTagsToSlate = { ...htmlTagsToSlate };
            // console.log('YES!', val, val.htmlTagsToSlate);

            // setTestingEditorRefLoaded(true);

            // console.log('DONE ! BEAUTIFUL !');
            setPleaseRerender(true);
          }
        }}
        {...props}
      />
    );
  };
};

export default withTestingFeatures;
