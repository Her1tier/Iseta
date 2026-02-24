/**
 * Compresses an image file to a specified maximum size.
 * @param {File} file - The image file to compress.
 * @param {number} maxSizeMB - Maximum file size in MB (default 0.5MB).
 * @param {number} maxWidth - Maximum width of the image (default 1920px).
 * @returns {Promise<File>} - A promise that resolves with the compressed File object.
 */
export const compressImage = async (file, maxSizeMB = 0.5, maxWidth = 1920) => {
    return new Promise((resolve, reject) => {
        if (!file.type.match(/image.*/)) {
            reject(new Error('File is not an image'));
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Resize if needed
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Start with high quality
                let quality = 0.9;

                const recursiveCompress = (q) => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Compression failed'));
                                return;
                            }

                            if (blob.size <= maxSizeMB * 1024 * 1024 || q <= 0.1) {
                                // Create a new File object
                                const compressedFile = new File([blob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now(),
                                });
                                resolve(compressedFile);
                            } else {
                                // Reduce quality and try again
                                recursiveCompress(q - 0.1);
                            }
                        },
                        'image/jpeg',
                        q
                    );
                };

                recursiveCompress(quality);
            };

            img.onerror = (error) => reject(error);
        };

        reader.onerror = (error) => reject(error);
    });
};
