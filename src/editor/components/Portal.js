import ReactDOM from 'react-dom';

export const Portal = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};
