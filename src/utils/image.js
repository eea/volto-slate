export function srcToDataUri(url) {
  // Based on https://github.com/ianstormtaylor/slate-plugins
  const canvas = window.document.createElement('canvas');
  const img = window.document.createElement('img');

  return new Promise((resolve, reject) => {
    if (!canvas.getContext) {
      return reject(new Error('Canvas is not supported.'));
    }

    img.onload = () => {
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const dataUri = canvas.toDataURL('image/png');
      resolve(dataUri);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image.'));
    };

    img.setAttribute('crossorigin', 'anonymous');
    img.src = url;
  });
}
