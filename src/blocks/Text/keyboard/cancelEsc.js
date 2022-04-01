export const cancelEsc = ({ editor, event }) => {
  console.log('cancelEsc', event);
  event.stopPropagation();
  event.nativeEvent.stopImmediatePropagation();
  event.preventDefault();
  return true;
};
