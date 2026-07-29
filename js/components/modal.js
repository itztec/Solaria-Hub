/**
 * MODAL COMPONENT
 * Flexible modal dialog manager for forms and detailed record views.
 */

export const Modal = {
    show({ title, contentHtml, maxWidth = '680px', onOpen = () => {} }) {
        let overlay = document.getElementById('global-modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'global-modal-overlay';
            overlay.className = 'modal-overlay';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="modal-container" style="max-width: ${maxWidth};">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close-btn" id="modal-close-trigger">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    ${contentHtml}
                </div>
            </div>
        `;

        overlay.classList.add('active');

        const closeBtn = overlay.querySelector('#modal-close-trigger');
        if (closeBtn) {
            closeBtn.onclick = () => this.close();
        }

        // Close on backdrop click
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                this.close();
            }
        };

        onOpen(overlay);
    },

    close() {
        const overlay = document.getElementById('global-modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
            }, 250);
        }
    }
};
