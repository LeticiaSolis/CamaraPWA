// Referencias a elementos del DOM
const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let stream = null;

async function openCamera() {
    try {
        // Pedimos la cámara sin forzar un tamaño exacto: el navegador da lo que mejor vaya.
        const constraints = {
            video: {
                facingMode: { ideal: 'environment' }
            }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;

        // Esperamos metadata para asegurar video.videoWidth/video.videoHeight estén disponibles
        await new Promise(resolve => {
            if (video.readyState >= 1 && video.videoWidth && video.videoHeight) {
                // ya tenemos metadata
                video.play().catch(()=>{});
                resolve();
            } else {
                video.onloadedmetadata = () => {
                    video.play().catch(()=>{});
                    resolve();
                };
            }
        });

        // MOSTRAR contenedor pero mantener el canvas visual en 320x240 (ya definido en HTML)
        cameraContainer.style.display = 'block';
        openCameraBtn.textContent = 'Cámara Abierta';
        openCameraBtn.disabled = true;

        console.log('Cámara abierta — video resolution:', video.videoWidth, 'x', video.videoHeight);
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
    }
}

// Tomar foto con center-crop para evitar distorsión
function takePhoto() {
    if (!stream) {
        alert('Primero debes abrir la cámara');
        return;
    }

    // Tamaño visual del canvas (ya definido en atributos del HTML)
    const destW = canvas.width;   // 320
    const destH = canvas.height;  // 240
    const destAspect = destW / destH;

    const srcW = video.videoWidth;
    const srcH = video.videoHeight;
    if (!srcW || !srcH) {
        alert('El video aún no está listo. Intenta de nuevo.');
        return;
    }
    const srcAspect = srcW / srcH;

    let sx, sy, sw, sh;

    if (srcAspect > destAspect) {
        // video es más ancho que el canvas -> recortamos los lados
        sh = srcH;
        sw = Math.round(sh * destAspect);
        sx = Math.round((srcW - sw) / 2);
        sy = 0;
    } else {
        // video es más alto que el canvas -> recortamos arriba/abajo
        sw = srcW;
        sh = Math.round(sw / destAspect);
        sx = 0;
        sy = Math.round((srcH - sh) / 2);
    }

    // Dibujamos el recorte del video en el canvas de tamaño fijo (320x240)
    ctx.clearRect(0, 0, destW, destH);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, destW, destH);

    const imageDataURL = canvas.toDataURL('image/png');
    console.log('Foto tomada:', imageDataURL.substring(0, 80) + '...');

    // opcional: cerrar cámara si quieres (en tu código original cerrabas)
    closeCamera();
}

// Cerrar cámara
function closeCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        video.srcObject = null;

        cameraContainer.style.display = 'none';
        openCameraBtn.textContent = 'Abrir Cámara';
        openCameraBtn.disabled = false;

        console.log('Cámara cerrada');
    }
}

// Eventos
openCameraBtn.addEventListener('click', openCamera);
takePhotoBtn.addEventListener('click', takePhoto);
window.addEventListener('beforeunload', closeCamera);
