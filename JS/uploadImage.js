let allImages = [];
let gallery = null;
let dropZone = null;
let currentImageIndex = -1;


/**
 * This function opens the image modal for a given image and displays its info.
 * Elements are looked up lazily via getElementById so script load order doesn't matter.
 *
 * @param {string} src - The base64 source of the image to display
 * @param {boolean} [hideTrash=false] - Whether to hide the delete button in the modal
 */
function openImageModal(src, hideTrash = false) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    if (!modal || !modalImage) return;
    currentImageIndex = allImages.findIndex(img => img.base64String === src);
    if (currentImageIndex === -1) return;
    modalImage.src = src;
    updateModalInfo();
    const deleteBtn = document.getElementById('deleteRemove');
    if (deleteBtn) {
        deleteBtn.style.display = hideTrash ? 'none' : '';
    }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

/**
 * Displays the next image in the modal if available, updating the modal content accordingly.
 */
function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % allImages.length;
    document.getElementById('modalImage').src = allImages[currentImageIndex].base64String;
    updateModalInfo();
}


/**
 * Displays the previous image in the modal if available, updating the modal content accordingly.
 */
function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
    document.getElementById('modalImage').src = allImages[currentImageIndex].base64String;
    updateModalInfo();
}


/**
 * Keydown event listener to navigate through images in the modal using left and right arrow keys.
 */
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
        nextImage();
    }
    if (event.key === 'ArrowLeft') {
        prevImage();
    }
});


document.addEventListener('keydown', (event) => {
    const modal = document.getElementById('modal');
    if (!modal || modal.style.display !== 'block') return;
    if (event.key === 'ArrowRight') nextImage();
    if (event.key === 'ArrowLeft') prevImage();
});


/**
 * Deletes the currently displayed image.
 */
function deleteCurrentImage() {
    if (currentImageIndex === -1) return;
    allImages.splice(currentImageIndex, 1);
    save();
    renderImages();
    closeImageModal();
}


/**
 * Closes the image modal and restores page scrolling.
 */
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';

    const deleteBtn = document.getElementById('deleteRemove');
    if (deleteBtn) deleteBtn.style.display = '';
}


/**
 * This function wires up listeners after DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    window.fileUpload = document.getElementById('fileUpload');
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
 * Processes a list of uploaded files by validating their types, compressing images, and storing them in an array for later rendering.
 *
 * @param {FileList} files - The files selected or dropped by the user
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
 *
 * @param {string} imageName - The name of the image to delete
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
 * Downloads the currently displayed image in the modal.
 */
function downloadCurrentImage() {
    const img = document.getElementById('modalImage');
    const name = document.getElementById('modalImageName').textContent;
    const link = document.createElement('a');
    link.href = img.src;
    link.download = name || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
