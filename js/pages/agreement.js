/**
 * AGREEMENT GENERATOR PAGE CONTROLLER
 * Renders legal document paper layout auto-filled with Company & Distributor metadata,
 * interactive signature blocks, and print / PDF export support.
 */

import { DistributorService } from '../services/distributorService.js';
import { SettingsService } from '../services/settingsService.js';
import { Toast } from '../components/toast.js';

export const AgreementPage = {
    async render(container) {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
        const targetId = params.get('distributorId');

        const distributors = await DistributorService.getAll();
        const settings = await SettingsService.getSettings();

        let selectedDistributor = null;
        if (targetId) {
            selectedDistributor = distributors.find(d => d.id === targetId);
        }
        if (!selectedDistributor && distributors.length > 0) {
            selectedDistributor = distributors[0];
        }

        container.innerHTML = `
            <div class="agreement-page-container">
                <!-- Action Toolbar (hidden during print) -->
                <div class="agreement-toolbar">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <label class="form-label" style="margin: 0; font-weight: 700;">Select Distributor:</label>
                        <select id="agreement-distributor-select" class="form-control" style="width: 280px;">
                            ${distributors.map(d => `
                                <option value="${d.id}" ${selectedDistributor && selectedDistributor.id === d.id ? 'selected' : ''}>
                                    ${d.companyName} (${d.distributorName}) - ${d.id}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div style="display: flex; gap: 12px;">
                        <button class="btn btn-secondary" id="btn-print-agreement">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                            Print Agreement
                        </button>
                        <button class="btn btn-primary" id="btn-pdf-agreement">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            Download as PDF
                        </button>
                    </div>
                </div>

                ${!selectedDistributor ? `
                    <div class="card empty-state">
                        <p>No distributor selected or available. Please create a distributor first.</p>
                    </div>
                ` : `
                    <!-- Legal Agreement Document Paper -->
                    <div class="agreement-paper">
                        <div class="agreement-letterhead">
                            <div class="company-letterhead-info">
                                <h2>${settings.companyName || 'Solaria Energy Systems Pvt Ltd'}</h2>
                                <p>${settings.address || ''}, ${settings.city || ''}, ${settings.state || ''} - ${settings.pincode || ''}</p>
                                <p>Phone: ${settings.phone || ''} | Email: ${settings.email || ''} | Web: ${settings.website || ''}</p>
                            </div>
                            <div>
                                ${settings.logo ? (settings.logo.startsWith('<svg') ? settings.logo : `<img src="${settings.logo}" class="company-letterhead-logo" alt="Company Logo" />`) : '<div style="font-size:36px;">☀️</div>'}
                            </div>
                        </div>

                        <div class="agreement-doc-title">
                            <h1>SOLAR DISTRIBUTOR AUTHORIZATION AGREEMENT</h1>
                            <div class="doc-ref">Ref No: AGR/${selectedDistributor.id}/2026 | Effective Date: ${selectedDistributor.agreementDate || new Date().toISOString().split('T')[0]}</div>
                        </div>

                        <div class="parties-grid">
                            <div class="party-box">
                                <h4>FIRST PARTY (MANUFACTURER)</h4>
                                <p class="font-bold">${settings.companyName || 'Solaria Energy Systems Pvt Ltd'}</p>
                                <p>${settings.address || ''}</p>
                                <p>Contact: ${settings.phone || ''}</p>
                                <p>Email: ${settings.email || ''}</p>
                            </div>
                            <div class="party-box">
                                <h4>SECOND PARTY (AUTHORIZED DISTRIBUTOR)</h4>
                                <p class="font-bold">${selectedDistributor.companyName}</p>
                                <p>Represented by: <strong>${selectedDistributor.distributorName}</strong></p>
                                <p>Address: ${selectedDistributor.fullAddress || selectedDistributor.area + ', ' + selectedDistributor.district}</p>
                                <p>District: ${selectedDistributor.district || '-'}, State: ${selectedDistributor.state || '-'}</p>
                                <p>Phone: ${selectedDistributor.phone} | Email: ${selectedDistributor.email || '-'}</p>
                            </div>
                        </div>

                        <div class="agreement-section">
                            <div class="agreement-section-heading">1. APPOINTMENT & TERRITORY</div>
                            <p>
                                The First Party hereby appoints <strong>${selectedDistributor.companyName}</strong> (Represented by <strong>${selectedDistributor.distributorName}</strong>) as its Authorized Regional Solar Product Distributor for the territory encompassing <strong>${selectedDistributor.area || 'Designated Zone'}</strong> within the <strong>${selectedDistributor.district || 'District'}</strong> district, <strong>${selectedDistributor.state || 'State'}</strong> state.
                            </p>
                        </div>

                        <div class="agreement-section">
                            <div class="agreement-section-heading">2. SCOPE OF PRODUCTS & SERVICES</div>
                            <p>
                                The Second Party is authorized to promote, stock, market, and distribute First Party's solar photovoltaic modules, solar power inverters, solar pump systems, and rooftop solar kit inventory to registered local solar retailers and certified installers within the designated territory.
                            </p>
                        </div>

                        <div class="agreement-section">
                            <div class="agreement-section-heading">3. OBLIGATIONS & COMPLIANCE</div>
                            <p>
                                The Second Party agrees to maintain minimum quarterly inventory levels, provide technical support to linked retail networks, honor manufacturer solar warranties, and adhere strictly to quality standards and official price directives established by <strong>${settings.companyName || 'Solaria Energy Systems Pvt Ltd'}</strong>.
                            </p>
                        </div>

                        <div class="agreement-section">
                            <div class="agreement-section-heading">4. DURATION & TERMINATION</div>
                            <p>
                                This agreement shall remain valid for a period of <strong>${selectedDistributor.agreementDuration ? selectedDistributor.agreementDuration + ' year' + (parseInt(selectedDistributor.agreementDuration) > 1 ? 's' : '') : '36 months'}</strong> starting from <strong>${selectedDistributor.agreementDate || 'the execution date'}</strong>${selectedDistributor.agreementEndDate ? ` and expiring on <strong>${selectedDistributor.agreementEndDate}</strong>` : ''}, renewable upon mutual consent. Either party may terminate this agreement by serving a 60-day written notice.
                            </p>
                        </div>

                        <!-- Signature Section -->
                        <div class="signature-section">
                            <div class="signature-box">
                                <div class="signature-line-space">
                                    <div class="signature-stamp">STAMP</div>
                                </div>
                                <div class="signatory-title">${selectedDistributor.distributorName}</div>
                                <div class="signatory-sub">Authorized Distributor Signature</div>
                                <div class="signatory-sub">${selectedDistributor.companyName}</div>
                            </div>

                            <div class="signature-box">
                                <div class="signature-line-space">
                                    <div class="signature-stamp">SOLARIA</div>
                                </div>
                                <div class="signatory-title">Authorized Signatory</div>
                                <div class="signatory-sub">Company Representative Signature</div>
                                <div class="signatory-sub">${settings.companyName || 'Solaria Energy Systems Pvt Ltd'}</div>
                            </div>
                        </div>
                    </div>
                `}
            </div>
        `;

        this.bindEvents(container);
    },

    bindEvents(container) {
        const selectEl = container.querySelector('#agreement-distributor-select');
        if (selectEl) {
            selectEl.addEventListener('change', (e) => {
                const newId = e.target.value;
                window.location.hash = `#agreement?distributorId=${newId}`;
            });
        }

        const printBtn = container.querySelector('#btn-print-agreement');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }

        const pdfBtn = container.querySelector('#btn-pdf-agreement');
        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => {
                Toast.info('Opening print dialog. Select "Save as PDF" to download the PDF document.');
                setTimeout(() => window.print(), 500);
            });
        }
    }
};
