import React from 'react';
import { CSSTransition } from 'react-transition-group';
import BlocksBrowserBody from './BlocksBrowserBody';
import ReactDOM from 'react-dom';

const DEFAULT_TIMEOUT = 500;

const withBlocksBrowser = (WrappedComponent) =>
  class extends React.Component {
    /**
     * Default properties
     * @property {Object} defaultProps Default properties.
     * @static
     */
    static defaultProps = {
      onChangeBlock: () => {},
      data: {},
      block: new Date().getTime() + '',
    };

    constructor() {
      super();
      this.state = { isObjectBrowserOpen: false };
    }

    /**
     * openObjectBrowser
     * @function openObjectBrowser
     * @param {Object} object ObjectBrowser configuration.
     * @param {string} object.dataName Name of the block data property to write the selected item.
     * @param {string} object.onSelectItem Function that will be called on item selection.
     * @param {string} object.overlay Boolean to show overlay background on content when opening objectBrowser.
     *
     * Usage:
     *
     * this.props.openObjectBrowser();
     *
     * this.props.openObjectBrowser({mode: 'link'});
     *
     * this.props.openObjectBrowser({
     *   dataName: 'myfancydatafield'
     *   });
     *
     * this.props.openObjectBrowser({
     *   onSelectItem: url =>
     *     this.props.onChangeBlock(this.props.block, {
     *       ...this.props.data,
     *       myfancydatafield: url,
     *     }),
     *   });
     */
    openObjectBrowser = ({
      onSelectItem = null,
      dataName = null,
      overlay = null,
      propDataName = null,
      selectableTypes,
      maximumSelectionSize,
    } = {}) =>
      this.setState(() => ({
        isObjectBrowserOpen: true,
        onSelectItem,
        dataName,
        overlay,
        propDataName,
        selectableTypes,
        maximumSelectionSize,
      }));

    closeObjectBrowser = () => this.setState({ isObjectBrowserOpen: false });

    render() {
      let contextURL = this.props.pathname ?? this.props.location?.pathname;
      return (
        <>
          <WrappedComponent
            {...this.props}
            isObjectBrowserOpen={this.state.isObjectBrowserOpen}
            openObjectBrowser={this.openObjectBrowser}
            closeObjectBrowser={this.closeObjectBrowser}
          />

          <>
            <CSSTransition
              in={this.state.isObjectBrowserOpen && this.state.overlay}
              timeout={DEFAULT_TIMEOUT}
              classNames="overlay-container"
              unmountOnExit
            >
              <>
                {__CLIENT__ &&
                  ReactDOM.createPortal(
                    <div className="overlay-container"></div>,
                    document.body,
                  )}
              </>
            </CSSTransition>
            <CSSTransition
              in={this.state.isObjectBrowserOpen}
              timeout={DEFAULT_TIMEOUT}
              classNames="sidebar-container"
              unmountOnExit
            >
              <BlocksBrowserBody
                {...this.props}
                data={
                  this.state.propDataName
                    ? this.props[this.state.propDataName]
                    : { ...this.props.data, contextURL }
                }
                closeObjectBrowser={this.closeObjectBrowser}
                onSelectItem={this.state.onSelectItem}
                dataName={this.state.dataName}
                selectableTypes={this.state.selectableTypes}
                maximumSelectionSize={this.state.maximumSelectionSize}
              />
            </CSSTransition>
          </>
        </>
      );
    }
  };
export default withBlocksBrowser;
