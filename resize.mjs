import sharp from 'sharp';

async function processIcon() {
    try {
        console.log("Resizing logo.png to 192x192 for push notifications...");
        await sharp('public/logo.png')
            .resize({ width: 192, height: 192, fit: 'contain', background: { r: 0, g: 0, b:0, alpha: 0 } })
            .png({ quality: 90, compressionLevel: 9 })
            .toFile('public/logo-push.png');
        console.log("Success! logo-push.png created.");
    } catch (e) {
        console.error("Failed to resize:", e);
    }
}

processIcon();
