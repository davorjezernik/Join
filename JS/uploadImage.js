let allImages = [];
let gallery = null;
let dropZone = null;


/**
 * This function opens/close helpers grab elements lazily so script order doesn't matter
 */
function openImageModal(src) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    if (!modal || !modalImage) return;
    modal.style.display = 'flex';
    modalImage.src = src; 
    document.body.style.overflow = 'hidden';
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
});


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
        if (!file.type.startsWith('image/')) {
            error.textContent = 'Please upload only image files.';
            continue;
        }
        if (allImages.some(img => img.name === file.name)) {
            continue; 
        }
        const blob = new Blob([file], { type: file.type });
        const compressedBase64String = await compressImage(file, 800, 800, 0.7);
        allImages.push({
            name: file.name, fileType: blob.type, base64String: compressedBase64String
        });
    }
    helperFunction();
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
 *  Loads previously saved images from localStorage and restores them into the application state, then triggers rendering to display them in the gallery.
 */
function loadImages() {
    let allImagesString = localStorage.getItem('allImages');
    if (allImagesString) {
        allImages = JSON.parse(allImagesString);
        renderImages();
    }
}


/**
 * 
 */
window.loadImages = loadImages;


/**
 * 
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
 * 
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
 * 
 */
function deleteAllImages() {
    if (!allImages || allImages.length === 0) return;
    allImages.length = 0;
    deleteAllImagesLocalStorage();
    save();
    renderImages();
}


/**
 * 
 */
function deleteAllImagesLocalStorage() {
    allImages = [];
    localStorage.removeItem('allImages');
}


/**
 * 
 */
['dragover', 'drop'].forEach(event => {
    document.addEventListener(event, e => e.preventDefault());
});


/**
 * 
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
 * 
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