export class MIMETypeName {
  constructor(name) {
    if (name.includes('/')) {
      this.firstName = name.split('/')[0];
      this.secondName = name.split('/')[1];
    } else {
      this.firstName = name;
      this.secondName = null;
    }
  }

  /**
   * @param {MIMETypeName} mt
   */
  matches(mt) {
    return (
      this.firstName === mt.firstName &&
      (this.secondName && mt.secondName
        ? this.secondName === mt.secondName
        : true)
    );
  }
}

export const withOrderedDataTransfers = (editor) => {
  editor.dataTransferFormatsOrder = [
    ...(editor.dataTransferFormatsOrder || []),
    'text/html',
    'files',
    'text/plain',
  ];
  editor.dataTransferHandlers = { ...(editor.dataTransferHandlers || {}) };

  const { insertData } = editor;

  // TODO: update and improve comments & docs related to
  // `dataTransferFormatsOrder` and `dataTransferHandlers` features
  editor.insertData = (data) => {
    if (editor.beforeInsertData) {
      editor.beforeInsertData(data);
    }

    for (let i = 0; i < editor.dataTransferFormatsOrder.length; ++i) {
      const x = editor.dataTransferFormatsOrder[i];
      if (x === 'files') {
        // TODO: also look for MIME Types in the 'files' case
        const { files } = data;
        if (files && files.length > 0) {
          if (editor.dataTransferHandlers?.['files']?.(files)) {
            // or handled here
            return true;
          }
        }
        continue;
      }
      const satisfyingFormats = data.types.filter((y) =>
        new MIMETypeName(x).matches(new MIMETypeName(y)),
      );
      for (let j = 0; j < satisfyingFormats.length; ++j) {
        const y = satisfyingFormats[j];
        if (editor.dataTransferHandlers?.[x]?.(data.getData(y), y)) {
          // handled here
          return true;
        }
      }
    }
    // not handled until this point
    return insertData(data);
  };

  return editor;
};
