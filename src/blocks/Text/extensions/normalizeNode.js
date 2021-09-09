export const normalizeNode = (editor) => {
  const { normalizeNode } = editor;
  editor.normalizeNode = (entry) => {
    normalizeNode(entry);
    console.log('normalized', entry);
  };

  return editor;
};
