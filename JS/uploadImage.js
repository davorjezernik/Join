let allImages = [];
let gallery = null;
let dropZone = null;
let currentImageIndex = -1;


/**
 * This function opens/close helpers grab elements lazily so script order doesn't matter
 */
function openImageModal(src) {
    currentImageIndex = allImages.findIndex(img => img.base64String === src);
    if (currentImageIndex === -1) return;
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    if (!modal || !modalImage) return;
    modalImage.src = src; 
    updateModalInfo();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function nextImage() {
    if (currentImageIndex < allImages.length - 1) {
        currentImageIndex++;
        document.getElementById('modalImage').src =
            allImages[currentImageIndex].base64String;
            updateModalInfo();
    }
}

function prevImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        document.getElementById('modalImage').src =
            allImages[currentImageIndex].base64String;
            updateModalInfo();
    }
}

function deleteCurrentImage() {
    if (currentImageIndex === -1) return;
    allImages.splice(currentImageIndex, 1);
    save();
    renderImages();
    closeImageModal();
}

function updateModalInfo() {
    if (currentImageIndex === -1) return;

    const image = allImages[currentImageIndex];

    const nameSpan = document.querySelector('.image-info p:nth-child(1) span');
    const sizeSpan = document.querySelector('.image-info p:nth-child(2) span');

    if (nameSpan) nameSpan.textContent = image.name;
    if (sizeSpan) sizeSpan.textContent = formatBytes(image.size);
}

/**
 * Closes the image modal and restores page scrolling.
 */
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}


/**
 * This function wire up listeners after DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    window.fileUpload = document.getElementById('fileUpload');
    // cache gallery and drop zone references globally
    gallery = document.getElementById('gallery');
    dropZone = document.getElementById('dropZone');
    window.gallery = gallery;
    window.dropZone = dropZone;
    const closeModalBtn = document.getElementById('closeModal');
    const modalElem = document.getElementById('imageModal');
    handleFilesHelp(fileUpload);
    handleCloseModal(closeModalBtn, modalElem);
    handleDrop(dropZone);
    loadImages();
    createErrorModal();
});


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
    content.appendChild(message);
    content.appendChild(closeBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);
}


/**
 * Attaches a change event listener to a file input element to handle file uploads when the user selects files.
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
 * Processes a list of uploaded files by validating their types, compressing images, and storing them in an array for later rendering.
 */
async function handleFiles(files) {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
        if (!validateFile(file)) continue;
        if (allImages.some(img => img.name === file.name)) {
            continue; 
        }
        const blob = new Blob([file], { type: file.type });
        const compressedBase64String = await compressImage(file, 800, 800, 0.7);
        allImages.push({
            name: file.name, fileType: blob.type, size: file.size, base64String: compressedBase64String
        });
    }
    helperFunction();
}


/**
 * Validates a file for upload: checks if it's an image and under 1 MB, showing error modals for issues.
 * @param {File} file - The file to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateFile(file) {
    if (!file.type.startsWith('image/')) {
        showErrorModal('Please upload only image files.');
        return false;
    }
    if (file.size > 1024 * 1024) {
        showErrorModal('File size exceeds 1 MB. Please choose a smaller image.');
        return false;
    }
    return true;
}


/**
 * Displays the custom error modal with a given message.
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
 * Saves the current list of images to the browser's localStorage.
 */
function save() {
    let allImagesString = JSON.stringify(allImages);
    localStorage.setItem('allImages', allImagesString);
}


/**
 * Loads previously saved images from localStorage and restores them into the 
 * application state, then triggers rendering to display them in the gallery.
 */
function loadImages() {
    let allImagesString = localStorage.getItem('allImages');
    if (allImagesString) {
        allImages = JSON.parse(allImagesString);
        renderImages();
    }
}


/**
 * Exposes the loadImages function globally so it can be accessed.
 */
window.loadImages = loadImages;


/**
 * Renders all stored images into the gallery container.
 */
function renderImages() {
    const target = window.gallery || gallery || document.getElementById('gallery');
    if (!target) return;
    target.innerHTML = '';
    allImages.forEach(image => {
        target.innerHTML += `
        <div class="image-container">
            <img class="main-image-upload" src="${image.base64String}" alt="${image.name}" onclick="openImageModal(this.src)">
            <div class="trashcan-container">
                <img class="traschcan-img" src="./img/trash.svg" alt="Delete" onclick="deleteImage('${image.name}')">     
            </div>
            <div class="image-name">
                <p class="image-name-text">${image.name}</p>
            </div>
        </div>`;
    });
}


/**
 * Deletes an image from the global `allImages` array by its name.
 */
function deleteImage(imageName) {
    const index = allImages.findIndex(image => image.name === imageName);
    if (index > -1) {
        allImages.splice(index, 1);
    }
    save();
    renderImages();
}


/**
 * Deletes all images from the global `allImages` array.
 */
function deleteAllImages() {
    if (!allImages || allImages.length === 0) return;
    allImages.length = 0;
    deleteAllImagesLocalStorage();
    save();
    renderImages();
}


/**
 * Deletes all images from the local storage `allImages` array.
 */
function deleteAllImagesLocalStorage() {
    allImages = [];
    localStorage.removeItem('allImages');
}


/**
 * Prevents the default behavior for 'dragover' and 'drop' events on the entire document to allow for custom drag-and-drop functionality without triggering unintended browser actions.
 */
['dragover', 'drop'].forEach(event => {
    document.addEventListener(event, e => e.preventDefault());
});


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
 * This stores the image size in a human-readable format (e.g., KB, MB) for display purposes.
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