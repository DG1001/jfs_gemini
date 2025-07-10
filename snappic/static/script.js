document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery-container');
    const uploadForm = document.getElementById('upload-form');
    const loadingIndicator = document.getElementById('loading-indicator');

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/static/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            }).catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }

    const uploadContainer = document.getElementById('upload-container');

    if (uploadContainer) {
        const fileTab = document.getElementById('file-tab');
        const cameraTab = document.getElementById('camera-tab');
        const fileUpload = document.getElementById('file-upload');
        const cameraUpload = document.getElementById('camera-upload');
        const video = document.getElementById('camera-stream');
        const captureBtn = document.getElementById('capture-btn');
        const canvas = document.getElementById('canvas');
        const fileInput = document.querySelector('input[type="file"]');
        let stream;

        fileTab.addEventListener('click', () => {
            fileTab.classList.add('active');
            cameraTab.classList.remove('active');
            fileUpload.classList.add('active');
            cameraUpload.classList.remove('active');
            stopCamera();
        });

        cameraTab.addEventListener('click', () => {
            cameraTab.classList.add('active');
            fileTab.classList.remove('active');
            cameraUpload.classList.add('active');
            fileUpload.classList.remove('active');
            startCamera();
        });

        async function startCamera() {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                    video.srcObject = stream;
                } catch (error) {
                    console.error("Error accessing camera: ", error);
                    alert('Kamerazugriff fehlgeschlagen. Bitte Berechtigungen prüfen.');
                }
            } else {
                alert('Dein Browser unterstützt die Kamera-API nicht.');
            }
        }

        function stopCamera() {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }

        captureBtn.addEventListener('click', () => {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(blob => {
                const capturedFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(capturedFile);
                fileInput.files = dataTransfer.files;

                // Switch back to file tab to show the captured image is ready
                fileTab.click();
                alert('Foto aufgenommen! Du kannst jetzt einen Kommentar hinzufügen und hochladen.');
            }, 'image/jpeg');
        });
    }

    // Gallery auto-refresh logic
    if (galleryContainer) {
        const fetchAndDisplayImages = async () => {
            try {
                const response = await fetch('/api/images');
                const images = await response.json();
                updateGallery(images);
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        };

        const displayedImageIds = new Set();

        const updateGallery = (images) => {
            const incomingImageIds = new Set(images.map(img => img.id));

            // Remove images that are no longer in the active list
            for (const displayedId of displayedImageIds) {
                if (!incomingImageIds.has(displayedId)) {
                    const oldItem = galleryContainer.querySelector(`[data-id="${displayedId}"]`);
                    if (oldItem) {
                        oldItem.style.animation = 'fadeOut 0.5s forwards';
                        setTimeout(() => oldItem.remove(), 500);
                    }
                    displayedImageIds.delete(displayedId);
                }
            }

            // Add or update images
            images.forEach(image => {
                const { id, filename, comment, age, lifetime, fadeout_duration } = image;

                if (!displayedImageIds.has(id)) {
                    // Create new item
                    const item = document.createElement('div');
                    item.classList.add('gallery-item');
                    item.dataset.id = id;
                    item.style.animation = 'fadeIn 0.5s';

                    const img = document.createElement('img');
                    img.src = `/uploads/${filename}`;
                    img.alt = comment;

                    const commentDiv = document.createElement('div');
                    commentDiv.classList.add('comment');
                    commentDiv.textContent = comment;

                    item.appendChild(img);
                    item.appendChild(commentDiv);
                    galleryContainer.appendChild(item);
                    displayedImageIds.add(id);
                } else {
                    // Update existing item (for fade-out)
                    const item = galleryContainer.querySelector(`[data-id="${id}"]`);
                    if (item && age > lifetime) {
                        const fadeOutProgress = Math.min(1, (age - lifetime) / fadeout_duration);
                        item.style.opacity = 1 - fadeOutProgress;
                    }
                }
            });
        };

        // Initial fetch and periodic refresh
        fetchAndDisplayImages();
        setInterval(fetchAndDisplayImages, 2000); // Refresh every 2 seconds
    }
});