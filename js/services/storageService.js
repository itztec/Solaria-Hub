/**
 * STORAGE SERVICE
 * Handles LocalStorage persistence, data initialization, and initial seed populating.
 * Structured to ensure zero UI dependency when migrating to PHP/MySQL later.
 */

const STORAGE_KEYS = {
    AUTH_USER: 'solar_auth_user',
    DISTRIBUTORS: 'solar_distributors',
    CUSTOMERS: 'solar_customers',
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
        password: 'password123',
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
        password: 'password123',
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
        password: 'password123',
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
        password: 'password123',
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

const DEFAULT_CUSTOMERS = [
    {
        id: 'CUST-2026-001',
        customerName: 'Aarav Mehta',
        phone: '9920199201',
        email: 'aarav.m@gmail.com',
        address: 'Flat 402, Green Avenue, Wakad, Pune',
        pincode: '411057',
        city: 'Pune',
        district: 'Pune',
        state: 'Maharashtra',
        systemSize: '4kw solar system',
        leadSource: 'Website Inquiry',
        caNumber: 'CA-98213871',
        sanctionLoad: '5 kW',
        bankLoan: 'No',
        projectCost: '220000',
        discomName: 'MSEDCL',
        connectionType: 'Single Phase',
        distributorId: 'DIS-2026-001',
        distributorName: 'GreenGrid Solar Tech',
        status: 'Active'
    },
    {
        id: 'CUST-2026-002',
        customerName: 'Priya Sundaram',
        phone: '9845012345',
        email: 'priya.sun@outlook.com',
        address: 'Villa 18, Palm Meadows, Marathahalli',
        pincode: '560037',
        city: 'Bengaluru',
        district: 'Bengaluru',
        state: 'Karnataka',
        systemSize: '3kw solar system',
        leadSource: 'Referral',
        caNumber: 'CA-44210988',
        sanctionLoad: '4 kW',
        bankLoan: 'Yes',
        projectCost: '175000',
        discomName: 'BESCOM',
        connectionType: 'Single Phase',
        distributorId: 'DIS-2026-002',
        distributorName: 'SunPower Enterprises',
        status: 'Active'
    },
    {
        id: 'CUST-2026-003',
        customerName: 'Ramesh Reddy',
        phone: '9440987654',
        email: 'ramesh.reddy@yahoo.com',
        address: 'Plot 88, KPHB Colony, Kukatpally',
        pincode: '500072',
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana',
        systemSize: '7.5 HP Solar Pump',
        leadSource: 'Exhibition',
        caNumber: 'CA-10928374',
        sanctionLoad: '8 kW',
        bankLoan: 'Yes',
        projectCost: '350000',
        discomName: 'TSSPDCL',
        connectionType: 'Three Phase',
        distributorId: 'DIS-2026-003',
        distributorName: 'Surya Infra & Electricals',
        status: 'Active'
    },
    {
        id: 'CUST-2026-004',
        customerName: 'Sanjay Verma',
        phone: '9811122334',
        email: 'sanjay.verma@gmail.com',
        address: 'H.No 45, Lajpat Nagar 2, New Delhi',
        pincode: '110024',
        city: 'Delhi',
        district: 'Delhi',
        state: 'Delhi',
        systemSize: '5kw solar system',
        leadSource: 'Social Media',
        caNumber: 'CA-55610293',
        sanctionLoad: '6 kW',
        bankLoan: 'No',
        projectCost: '265000',
        discomName: 'BSES Rajdhani',
        connectionType: 'Three Phase',
        distributorId: 'DIS-2026-004',
        distributorName: 'EcoRay Energy Ltd',
        status: 'Pending'
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
        if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
            localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(DEFAULT_CUSTOMERS));
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

