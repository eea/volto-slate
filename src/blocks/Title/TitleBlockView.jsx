/**
 * View title/description block.
 * @module volto-slate/blocks/Title/TitleBlockView
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * View title block component.
 * @class View
 * @extends Component
 */
const TitleBlockView = ({ properties, className, formFieldName }) => (
  <h1 className={className}>{properties[formFieldName] || ''}</h1>
);

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
TitleBlockView.propTypes = {
  properties: PropTypes.objectOf(PropTypes.any).isRequired,
  className: PropTypes.string.isRequired,
  formFieldName: PropTypes.string.isRequired,
};

export default TitleBlockView;
