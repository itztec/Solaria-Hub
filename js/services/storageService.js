/**
 * STORAGE SERVICE
 * Handles LocalStorage persistence, data initialization, and initial seed populating.
 * Structured to ensure zero UI dependency when migrating to PHP/MySQL later.
 */

const STORAGE_KEYS = {
    AUTH_USER: 'solar_auth_user',
    DISTRIBUTORS: 'solar_distributors',
    RETAILERS: 'solar_retailers',
    SETTINGS: 'solar_settings'
};

// Initial Seed Data for Instant Demonstration
const DEFAULT_SETTINGS = {
    companyName: 'Solaria Energy Systems Pvt Ltd',
    logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMDU5NjY5Ij48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzMCIvPjxnIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2UtbGluZWNhcD0icm91bmQiPjxsaW5lIHgxPSI1MCIgeTE9IjUiIHgyPSI1MCIgeTI9IjE1Ii8+PGxpbmUgeDE9IjUwIiB5MT0iODUiIHgyPSI1MCIgeTI9Ijk1Ii8+PGxpbmUgeDE9IjUiIHkxPSI1MCIgeDI9IjE1IiB5Mj0iNTAiLz48bGluZSB4MT0iODUiIHkxPSI1MCIgeDI9Ijk1IiB5Mj0iNTAiLz48bGluZSB4MT0iMTgiIHkxPSIxOCIgeDI9IjI1IiB5Mj0iMjUiLz48bGluZSB4MT0iNzUiIHkxPSI3NSIgeDI9IjgyIiB5Mj0iODIiLz48bGluZSB4MT0iODIiIHkxPSIxOCIgeDI9Ijc1IiB5Mj0iMjUiLz48bGluZSB4MT0iMjUiIHkxPSI3NSIgeDI9IjE4IiB5Mj0iODIiLz48L2c+PC9zdmc+',
    address: 'Solar Innovation Tower, Tech Park Road, Sector 62',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    phone: '+91 98765 43210',
    email: 'info@solariaenergy.com',
    website: 'https://www.solariaenergy.com'
};

const DEFAULT_DISTRIBUTORS = [
    {
        id: 'DIS-2026-001',
        companyName: 'GreenGrid Solar Tech',
        distributorName: 'Rajesh Sharma',
        phone: '9823011223',
        altPhone: '9823011299',
        email: 'rajesh@greengrid.in',
        state: 'Maharashtra',
        district: 'Pune',
        area: 'Hinjewadi',
        pincode: '411057',
        fullAddress: 'Plot 45, Phase 1, Hinjewadi IT Park, Pune',
        agreementDate: '2026-01-15',
        status: 'Active',
        photo: '',
        pdfDoc: '',
        notes: 'Premium tier solar inverter & panel distributor for Western Maharashtra.'
    },
    {
        id: 'DIS-2026-002',
        companyName: 'SunPower Enterprises',
        distributorName: 'Anita Roy',
        phone: '9711099887',
        altPhone: '9711099800',
        email: 'anita@sunpower.com',
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        area: 'Whitefield',
        pincode: '560066',
        fullAddress: 'No 12, EPIP Zone, Whitefield, Bengaluru',
        agreementDate: '2026-02-10',
        status: 'Active',
        photo: '',
        pdfDoc: '',
        notes: 'Leading distributor handling commercial solar rooftop projects.'
    },
    {
        id: 'DIS-2026-003',
        companyName: 'Surya Infra & Electricals',
        distributorName: 'Venkatesh Rao',
        phone: '9440122334',
        altPhone: '',
        email: 'vrao@suryainfra.com',
        state: 'Telangana',
        district: 'Hyderabad',
        area: 'Gachibowli',
        pincode: '500032',
        fullAddress: 'Building B, Financial District, Gachibowli, Hyderabad',
        agreementDate: '2026-03-01',
        status: 'Active',
        photo: '',
        pdfDoc: '',
        notes: 'Authorized distribution channel for Telangana solar pump solutions.'
    },
    {
        id: 'DIS-2026-004',
        companyName: 'EcoRay Energy Ltd',
        distributorName: 'Vikram Singh',
        phone: '9810055443',
        altPhone: '9810055444',
        email: 'vikram@ecoray.in',
        state: 'Delhi',
        district: 'South Delhi',
        area: 'Okhla Phase 3',
        pincode: '110020',
        fullAddress: 'C-21, Okhla Industrial Area Phase 3, New Delhi',
        agreementDate: '2026-04-12',
        status: 'Pending',
        photo: '',
        pdfDoc: '',
        notes: 'Agreement pending final compliance verification.'
    }
];

const DEFAULT_RETAILERS = [
    {
        id: 'RET-2026-001',
        retailerName: 'Suresh Patel',
        shopName: 'Patel Solar & Electrical Hardware',
        phone: '9920199201',
        email: 'patelsolar@gmail.com',
        distributorId: 'DIS-2026-001',
        state: 'Maharashtra',
        district: 'Pune',
        area: 'Wakad',
        address: 'Shop 4, Datta Mandir Road, Wakad, Pune',
        status: 'Active',
        photo: '',
        notes: 'Top performing retail shop for residential rooftop kits.'
    },
    {
        id: 'RET-2026-002',
        retailerName: 'Manoj Kumar',
        shopName: 'Manoj Green Energy Store',
        phone: '9845012345',
        email: 'manojgreen@outlook.com',
        distributorId: 'DIS-2026-002',
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        area: 'Marathahalli',
        address: 'Main Outer Ring Road, Marathahalli, Bengaluru',
        status: 'Active',
        photo: '',
        notes: 'Specializes in solar battery storage units.'
    },
    {
        id: 'RET-2026-003',
        retailerName: 'Prakash Naidu',
        shopName: 'Surya Power Mart',
        phone: '9440987654',
        email: 'prakash@suryamart.in',
        distributorId: 'DIS-2026-003',
        state: 'Telangana',
        district: 'Hyderabad',
        area: 'Kukatpally',
        address: 'Opp. Metro Pillar 12, Kukatpally, Hyderabad',
        status: 'Active',
        photo: '',
        notes: 'Retail partner for agricultural solar pumps.'
    },
    {
        id: 'RET-2026-004',
        retailerName: 'Amit Verma',
        shopName: 'Verma Electricals & Solar',
        phone: '9811122334',
        email: 'vermaelec@yahoo.com',
        distributorId: 'DIS-2026-004',
        state: 'Delhi',
        district: 'South Delhi',
        area: 'Lajpat Nagar',
        address: 'Central Market, Lajpat Nagar 2, Delhi',
        status: 'Pending',
        photo: '',
        notes: 'New retail onboarding.'
    }
];

export const StorageService = {
    init() {
        if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.DISTRIBUTORS)) {
            localStorage.setItem(STORAGE_KEYS.DISTRIBUTORS, JSON.stringify(DEFAULT_DISTRIBUTORS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.RETAILERS)) {
            localStorage.setItem(STORAGE_KEYS.RETAILERS, JSON.stringify(DEFAULT_RETAILERS));
        }
    },

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error(`Error reading ${key} from LocalStorage`, e);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`Error writing ${key} to LocalStorage`, e);
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    KEYS: STORAGE_KEYS
};

// Initialize seed data on load
StorageService.init();
