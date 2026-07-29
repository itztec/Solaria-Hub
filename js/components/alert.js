/**
 * SWEETALERT STYLE CONFIRMATION MODAL
 * Provides beautiful confirmation dialogs for deletions and critical actions.
 */

export const SweetAlert = {
    confirm({ title = 'Are you sure?', text = 'You won\'t be able to revert this!', confirmButtonText = 'Yes, delete it!', cancelButtonText = 'Cancel', type = 'warning' }) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay active';
            overlay.style.zIndex = '3000';

            const iconSvg = type === 'warning' || type === 'danger' ? `
                <div class="sweet-alert-icon danger">
                    <svg width="36" height="36" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </div>` : '';

            overlay.innerHTML = `
                <div class="modal-container" style="max-width: 420px; border-radius: 20px;">
                    <div class="modal-body sweet-alert-box">
                        ${iconSvg}
                        <h3 class="sweet-alert-title">${title}</h3>
                        <p class="sweet-alert-text">${text}</p>
                        <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px;">
                            <button class="btn btn-secondary" id="swal-cancel-btn">${cancelButtonText}</button>
                            <button class="btn btn-danger" id="swal-confirm-btn">${confirmButtonText}</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const cleanup = (result) => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.remove();
                    resolve(result);
                }, 200);
            };

            overlay.querySelector('#swal-confirm-btn').addEventListener('click', () => cleanup(true));
            overlay.querySelector('#swal-cancel-btn').addEventListener('click', () => cleanup(false));
        });
    }
};
