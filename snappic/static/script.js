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

    // Handle form submission with loading indicator
    if (uploadForm) {
        uploadForm.addEventListener('submit', () => {
            if (loadingIndicator) {
                loadingIndicator.style.display = 'block';
            }
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

        const updateGallery = (images) => {
            galleryContainer.innerHTML = ''; // Clear existing content

            images.forEach(image => {
                const age = image.age;
                const lifetime = image.lifetime;
                const fadeoutDuration = image.fadeout_duration;

                const item = document.createElement('div');
                item.classList.add('gallery-item');
                item.dataset.id = image.id;

                const img = document.createElement('img');
                img.src = `/uploads/${image.filename}`;
                img.alt = image.comment;

                const comment = document.createElement('div');
                comment.classList.add('comment');
                comment.textContent = image.comment;

                item.appendChild(img);
                item.appendChild(comment);

                // Handle fade-out animation
                if (age > lifetime) {
                    const fadeOutProgress = (age - lifetime) / fadeoutDuration;
                    item.style.opacity = 1 - fadeOutProgress;
                }

                galleryContainer.appendChild(item);
            });
        };

        // Initial fetch and periodic refresh
        fetchAndDisplayImages();
        setInterval(fetchAndDisplayImages, 2000); // Refresh every 2 seconds
    }
});