document.addEventListener('DOMContentLoaded', () => {
    // --- Main Page Logic (index.html) ---
    const weddingForm = document.getElementById('weddingForm');
    const attachSlipBtn = document.getElementById('attachSlipBtn');
    const slipInput = document.getElementById('slipInput');

    if (attachSlipBtn && slipInput) {
        attachSlipBtn.addEventListener('click', () => {
            const redirectUrl = attachSlipBtn.getAttribute('blank');
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                slipInput.click();
            }
        });
        
        slipInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                const fileName = e.target.files[0].name;
                attachSlipBtn.textContent = '✓ แนบสลิปเรียบร้อย';
                attachSlipBtn.style.backgroundColor = '#4CAF50';
            }
        });
    }

    if (weddingForm) {
        weddingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            modal.classList.add('show');
        });
    }

    // --- Upload Page Logic (upload.html) ---
    const uploadForm = document.getElementById('uploadForm');
    const dropZone = document.getElementById('dropZone');
    const slipUploadInput = document.getElementById('slipUploadInput');
    const slipPreview = document.getElementById('slipPreview');
    const previewContainer = document.getElementById('previewContainer');

    if (dropZone && slipUploadInput) {
        dropZone.addEventListener('click', () => slipUploadInput.click());

        slipUploadInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                    slipPreview.src = event.target.result;
                    previewContainer.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!slipUploadInput.files.length) {
                alert('กรุณาแนบสลิปโอนเงินก่อนทำการส่งค่ะ/ครับ');
                return;
            }
            modal.classList.add('show');
        });
    }

    // --- Common Logic ---
    const modal = document.getElementById('successModal');
    const closeModalBtns = document.querySelectorAll('.close-modal, .btn-close-modal');

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});
