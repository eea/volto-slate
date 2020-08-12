/**
 * View title block.
 * @module volto-slate/blocks/Title/TitleBlockView
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * View title block component.
 * @class View
 * @extends Component
 */
const TitleBlockView = ({ properties }) => (
  <h1 className="documentFirstHeading">{properties.title}</h1>
);

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
TitleBlockView.propTypes = {
  properties: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default TitleBlockView;
