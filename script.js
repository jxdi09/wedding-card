document.addEventListener('DOMContentLoaded', () => {
    // 🔴 เอา URL จากตอน Deploy Apps Script มาวางตรงนี้ 🔴
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby9C_iU3PyF9v4ko2TKPBuxssomPzp4m3K3evddDyY84K5UmUWsoBOq3Sbp9HAGDISh-w/exec";

    // DOM Elements
    const btnOpenSlipModal = document.getElementById('btn-open-slip-modal');
    const slipModal = document.getElementById('slip-modal');
    const closeSlipModal = document.getElementById('close-slip-modal');
    
    const uploadArea = document.getElementById('upload-area');
    const slipInput = document.getElementById('slip-input');
    const slipPreview = document.getElementById('slip-preview');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const btnConfirmSlip = document.getElementById('btn-confirm-slip');
    const slipStatus = document.getElementById('slip-status');
    
    const guestNameInput = document.getElementById('guest-name');
    const btnSubmit = document.getElementById('btn-submit');
    const weddingForm = document.getElementById('wedding-form');
    
    const thankYouModal = document.getElementById('thank-you-modal');
    const btnCloseThankYou = document.getElementById('btn-close-thank-you');
    const thankYouName = document.getElementById('thank-you-name');
    const loadingOverlay = document.getElementById('loading-overlay');

    let slipImageBase64 = null;

    // --- Modal Logic ---
    function openModal(modal) {
        modal.classList.add('show');
    }

    function closeModal(modal) {
        modal.classList.remove('show');
    }

    btnOpenSlipModal.addEventListener('click', () => {
        openModal(slipModal);
    });

    closeSlipModal.addEventListener('click', () => {
        closeModal(slipModal);
    });

    btnCloseThankYou.addEventListener('click', () => {
        closeModal(thankYouModal);
        // Reset form
        weddingForm.reset();
        slipPreview.classList.add('hidden');
        uploadPlaceholder.classList.remove('hidden');
        btnConfirmSlip.disabled = true;
        btnOpenSlipModal.textContent = "+ แนบสลิปของท่าน";
        if (slipStatus) slipStatus.classList.add('hidden');
        slipImageBase64 = null;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Close modal if clicked outside
    window.addEventListener('click', (e) => {
        if (e.target === slipModal) closeModal(slipModal);
        if (e.target === thankYouModal) btnCloseThankYou.click();
    });

    // --- Upload Slip Logic ---
    uploadArea.addEventListener('click', () => {
        slipInput.click();
    });

    slipInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // ลดขนาดภาพเพื่อไม่ให้เกินโควต้า Google Apps Script
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // บีบอัดภาพเป็น JPEG คุณภาพ 70%
                    slipImageBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    
                    slipPreview.src = slipImageBase64;
                    slipPreview.classList.remove('hidden');
                    uploadPlaceholder.classList.add('hidden');
                    btnConfirmSlip.disabled = false;
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // --- Confirm Slip & Autofill Logic ---
    btnConfirmSlip.addEventListener('click', () => {
        closeModal(slipModal);
        loadingOverlay.classList.remove('hidden');
        
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            
            btnOpenSlipModal.textContent = "✅ แนบสลิปแล้ว (เปลี่ยน)";
            if (slipStatus) slipStatus.classList.remove('hidden');
            
            // Mock OCR extraction (only name)
            if (!guestNameInput.value) {
                guestNameInput.value = "สมชาย ใจดี";
            }
            
        }, 1200);
    });

    // --- Form Submit Logic ---
    weddingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        loadingOverlay.classList.remove('hidden');

        const formData = new FormData(weddingForm);
        const data = {
            name: formData.get('guest-name'),
            relation: formData.get('relation'),
            attending: formData.get('attending'),
            message: formData.get('message'),
            slip: slipImageBase64
        };

        // Real API Call to Google Apps Script
        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // สำคัญมากสำหรับ Google Apps Script
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(() => {
            // โหมด no-cors จะไม่คืนค่า JSON กลับมา แต่อ่านว่า request ส่งไปแล้ว
            loadingOverlay.classList.add('hidden');
            thankYouName.textContent = data.name;
            openModal(thankYouModal);
        })
        .catch(err => {
            loadingOverlay.classList.add('hidden');
            alert("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้งครับ");
            console.error(err);
        });
    });
});
