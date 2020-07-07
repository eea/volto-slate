export const softBreakHandler = (e, editor) => {
  if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    editor.insertText('\n');
  }
};

export default softBreakHandler;
