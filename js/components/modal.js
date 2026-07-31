/**
 * MODAL COMPONENT
 * Flexible modal dialog manager for forms and detailed record views.
 */

// Expose Modal globally immediately so inline HTML onclick="Modal.close()" works everywhere
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
                    <button type="button" class="modal-close-btn" id="modal-close-trigger" onclick="window.Modal.close()" title="Close">
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
            closeBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.close();
            };
        }

        // Auto bind cancel/close buttons inside modal body
        overlay.querySelectorAll('button, .btn, .btn-secondary, [data-dismiss="modal"]').forEach(btn => {
            const txt = btn.textContent.trim().toLowerCase();
            if (txt.includes('cancel') || txt.includes('close') || btn.getAttribute('data-dismiss') === 'modal') {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.close();
                });
            }
        });

        // Close on backdrop click
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                this.close();
            }
        };

        onOpen(overlay);
    },

    open(opts) {
        return this.show({
            title: opts.title,
            contentHtml: opts.contentHtml || opts.content,
            maxWidth: opts.maxWidth || opts.width || '680px',
            onOpen: opts.onOpen
        });
    },

    close() {
        const overlay = document.getElementById('global-modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
            }, 200);
        }
    }
};

if (typeof window !== 'undefined') {
    window.Modal = Modal;
}
