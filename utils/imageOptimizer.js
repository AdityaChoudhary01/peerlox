export const optimizeAvatar = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                // Target size for Avatar
                const MAX_SIZE = 256; 
                canvas.width = MAX_SIZE;
                canvas.height = MAX_SIZE;

                // Crop to center square
                const size = Math.min(img.width, img.height);
                const startX = (img.width - size) / 2;
                const startY = (img.height - size) / 2;

                ctx.drawImage(img, startX, startY, size, size, 0, 0, MAX_SIZE, MAX_SIZE);

                // Convert to WebP with 0.8 quality (usually results in a file < 15KB)
                canvas.toBlob((blob) => {
                    if (blob) {
                        const optimizedFile = new File([blob], `avatar.webp`, {
                            type: "image/webp",
                        });
                        resolve(optimizedFile);
                    } else {
                        reject(new Error("Canvas to Blob failed"));
                    }
                }, "image/webp", 0.8);
            };
            img.onerror = (error) => reject(error);
        };
    });
};