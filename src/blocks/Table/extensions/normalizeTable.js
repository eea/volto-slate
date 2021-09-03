export const normalizeTable = (editor) => {
  // Normalization rules for table cells

  const { normalizeNode } = editor;
  // const { slate } = config.settings;

  editor.normalizeNode = (entry) => {
    // const [node, path] = entry;

    normalizeNode(entry);
  };

  return editor;
};
