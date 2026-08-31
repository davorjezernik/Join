/**
 * Updates the information displayed in the image modal based on the current image.
 */
function updateModalInfo() {
    if (currentImageIndex === -1) return;
    const image = allImages[currentImageIndex];
    const nameSpan = document.querySelector('.image-info p:nth-child(1) span');
    const sizeSpan = document.querySelector('.image-info p:nth-child(2) span');
    if (nameSpan) nameSpan.textContent = image.name;
    if (sizeSpan) sizeSpan.textContent = formatBytes(image.size);
}


/**
 * Creates a custom error modal for displaying validation messages.
 */
function createErrorModal() {
    const modal = document.createElement('div');
    modal.id = 'errorModal';
    modal.className = 'error-modal';
    const content = document.createElement('div');
    content.id = 'errorModalContent';
    content.className = 'error-modal-content';
    const message = document.createElement('p');
    message.id = 'errorMessage';
    const closeBtn = document.createElement('button');
    closeBtn.id = 'closeErrorModal';
    closeBtn.textContent = 'OK';
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    content.append(message, closeBtn);
    modal.append(content);
    document.body.append(modal);
}


/**
 * Attaches a change event listener to a file input element to handle file uploads when the user selects files.
 *
 * @param {HTMLInputElement} fileUpload - The file input element to watch
 */
function handleFilesHelp(fileUpload) {
    if (fileUpload) {
        fileUpload.addEventListener('change', () => {
            handleFiles(fileUpload.files);
        });
    }
}


/**
 * Registers event listeners to close an image modal.
 *
 * @param {HTMLElement} closeModalBtn - The button that closes the modal
 * @param {HTMLElement} modalElem - The modal element itself
 */
function handleCloseModal(closeModalBtn, modalElem) {
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeImageModal);
    }
    if (modalElem) {
        modalElem.addEventListener('click', (e) => {
            if (e.target === modalElem) closeImageModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeImageModal();
    });
}


/**
 * Enables drag-and-drop file upload behavior for a given drop zone element.
 *
 * @param {HTMLElement} dropZone - The element files can be dragged onto
 */
function handleDrop(dropZone) {
    if (!dropZone) return;
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
}


/**
 * Validates a file for upload: checks if it's an image and under 50 MB, showing error modals for issues.
 *
 * @param {File} file - The file to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateFile(file) {
    if (!file.type.startsWith('image/')) {
        showErrorModal('Please upload only image files.');
        return false;
    }
    if (file.size > 50 * 1024 * 1024) {
        showErrorModal('File size exceeds 50 MB. Please choose a smaller image.');
        return false;
    }
    return true;
}


/**
 * Displays the custom error modal with a given message.
 *
 * @param {string} message - The error message to display.
 */
function showErrorModal(message) {
    const modal = document.getElementById('errorModal');
    const msg = document.getElementById('errorMessage');
    msg.textContent = message;
    modal.style.display = 'flex';
}


/**
 * Executes post-processing after files are handled.
 */
function helperFunction() {
    save();
    renderImages();
    if (window.fileUpload) {
        window.fileUpload.value = '';
    }
}


/**
 * Compresses an image file by resizing it to fit within specified
 * dimensions and adjusting its quality, returning a Base64 string.
 *
 * @param {File} file - The image file to compress.
 * @param {number} maxWidth - The maximum width of the output image.
 * @param {number} maxHeight - The maximum height of the output image.
 * @param {number} quality - The compression quality (0 to 1).
 * @returns {Promise<string>} A promise that resolves with the compressed
 * image as a Base64-encoded string.
 */
function compressImage(file, maxWidth, maxHeight, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const img = new Image();
        reader.addEventListener('load', event => {
            img.src = event.target.result;
        });
        reader.addEventListener('error', () => reject('File reading failed'));
        helpFunctuinImg(img, file, maxWidth, maxHeight, quality, resolve);
        img.addEventListener('error', () => reject('Image loading failed'));
        reader.readAsDataURL(file);
    });
}


/**
 * Helper function that resizes and compresses an image once it is loaded.
 * Draws the image onto a canvas scaled to the specified maximum dimensions,
 * applies the requested quality, and resolves the result as a Base64 string.
 *
 * @param {HTMLImageElement} img - The image element to draw and resolve once loaded
 * @param {File} file - The original file, used for its MIME type
 * @param {number} maxWidth - The maximum width of the output image
 * @param {number} maxHeight - The maximum height of the output image
 * @param {number} quality - The compression quality (0 to 1)
 * @param {(value: string) => void} resolve - Resolver of the enclosing compressImage promise
 */
function helpFunctuinImg(img, file, maxWidth, maxHeight, quality, resolve) {
    img.addEventListener('load', () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
            const scale = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL(file.type, quality);
        resolve(compressedBase64);
    });
}


/**
 * Formats a byte count into a human-readable string (e.g., KB, MB) for display purposes.
 *
 * @param {number} bytes - The size in bytes to format
 * @param {number} [decimals=2] - Number of decimal places to keep
 * @returns {string} The formatted size, e.g. "1.5 MB"
 */
function formatBytes(bytes, decimals = 2) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}


/**
 * This function converts blob into base64
 *
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
function blobToBase64(blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}
