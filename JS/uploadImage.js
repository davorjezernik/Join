let allImages = [];

const fileUpload = document.getElementById('fileUpload');

/**
 * This function uploads files and displays them in the gallery
 */
const gallery = document.getElementById('gallery');
const dropZone = document.getElementById('dropZone');

fileUpload.addEventListener('change', () => {
    handleFiles(fileUpload.files);
});

async function handleFiles(files) {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
            error.textContent = 'Please upload only image files.';
            continue;
        }

        const blob = new Blob([file], { type: file.type });
        const compressedBase64String = await compressImage(file, 800, 800, 0.7);

        const img = document.createElement('img');
        img.src = compressedBase64String;
        gallery.appendChild(img);

        allImages.push({
            name: file.name,
            fileType: blob.type,
            base64String: compressedBase64String
        });
    }

    save();
    renderImages();
}



/* allow drop */
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

/* remove highlight */
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

/* handle drop */
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});



function save() {
    let allImagesString = JSON.stringify(allImages);
    localStorage.setItem('allImages', allImagesString);
}


function loadImages() {
    let allImagesString = localStorage.getItem('allImages');
    if (allImagesString) {
        allImages = JSON.parse(allImagesString);
        renderImages();
    }
}


function renderImages() {
    gallery.innerHTML = '';
    allImages.forEach(image => {
        gallery.innerHTML += `
        <div class="image-container">
            <img class="main-image-upload" src="${image.base64String}" alt="${image.name}">
            <div class="trashcan-container">
            <div>
                <img class="traschcan-img" src="./img/trash.svg" alt="Delete" onclick="deleteImage('${image.name}')">
                <div class="image-name">
                    <p class="image-name-text">${image.name}</p>
                </div>
            </div>
            </div>
        </div>`;
    });
}

function deleteImage(imageName) {
    const index = allImages.findIndex(image => image.name === imageName);
    if (index > -1) {
        allImages.splice(index, 1);
    }
    save();
    renderImages();
}

function deleteAllImages() {
    if (!allImages || allImages.length === 0) return;
    allImages.length = 0;
    deleteAllImagesLocalStorage();
    save();
    renderImages();
}

function deleteAllImagesLocalStorage() {
    allImages = [];
    localStorage.removeItem('allImages');
}


['dragover', 'drop'].forEach(event => {
    document.addEventListener(event, e => e.preventDefault());
});



function compressImage(file, maxWidth, maxHeight, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const img = new Image();

        reader.addEventListener('load', event => {
            img.src = event.target.result;
        });

        reader.addEventListener('error', () => reject('File reading failed'));

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

        img.addEventListener('error', () => reject('Image loading failed'));

        reader.readAsDataURL(file);
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