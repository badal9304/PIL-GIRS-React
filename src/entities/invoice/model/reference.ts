/** Reference data used by invoice rules and documents (customer details, charge names, locations, FX). */
export interface InvoiceCustomer {
  name: string;
  tax: string;
  addr: string;
  mail: string;
}

export const INVOICE_CUSTOMERS: Readonly<Record<string, InvoiceCustomer>> = {
  'SG-100231': {
    name: 'Straits Harbour Logistics (SG)',
    tax: 'UEN 201812345K',
    addr: '21 Pioneer Road, #04-02, Singapore 628491',
    mail: 'ap@straitsharbour.sg',
  },
  'SG-100874': {
    name: 'Meridian Agro Exports (SG)',
    tax: 'UEN 199904417M',
    addr: '8 Jurong Port Road, Singapore 619088',
    mail: 'finance@meridianagro.sg',
  },
  'SG-101066': {
    name: 'Kinabalu Home Furnishings (SG)',
    tax: 'UEN 201533018D',
    addr: '60 Tuas South Ave 1, Singapore 637611',
    mail: 'billing@kinabaluhome.sg',
  },
  'MY-200417': {
    name: 'Straits Harbour Logistics (MY)',
    tax: 'C20811047090',
    addr: 'Lot 12, Jalan Pelabuhan, 42000 Port Klang',
    mail: 'ap@straitsharbour.my',
  },
  'IN-300552': {
    name: 'Straits Harbour Logistics (IN)',
    tax: 'GSTIN 27AAGCS4412L1Z5',
    addr: 'Plot 7, JNPT Road, Navi Mumbai 400707',
    mail: 'ap@straitsharbour.in',
  },
  'IN-300781': {
    name: 'Orchid Lane Polymers (IN)',
    tax: 'GSTIN 24AACCO9021P1ZK',
    addr: 'Survey 118, Vapi GIDC, Gujarat 396195',
    mail: 'accounts@orchidlane.in',
  },
  'MY-200903': {
    name: 'Kinabalu Home Furnishings (MY)',
    tax: 'C21003391080',
    addr: 'No. 3, Jalan Perigi, 81700 Pasir Gudang',
    mail: 'billing@kinabaluhome.my',
  },
  'TH-500318': {
    name: 'Andaman Bay Traders (TH)',
    tax: 'TIN 0105559013374',
    addr: '88 Moo 3, Laem Chabang, Chonburi 20230',
    mail: 'ar@andamanbay.co.th',
  },
};

/** Charge code -> charge name. */
export const CHARGE_NAMES: Readonly<Record<string, string>> = {
  MISC: 'Miscellaneous Charge',
  OFT: 'Ocean Freight',
  BAF: 'Bunker Adjustment Factor',
  'THC-O': 'Origin THC',
  'THC-DST': 'Destination THC',
  DOC: 'Documentation',
  DEM: 'Demurrage',
  DET: 'Detention',
  SEAL: 'Seal Fee',
  LSS: 'Low Sulphur Surcharge',
};

/** Port -> [location code, country, local currency, ROE to USD, standard tax code, freight tax code] */
export const LOCATIONS: Readonly<Record<string, readonly [string, string, string, string, string, string]>> = {
  SGSIN: ['SIN', 'SG', 'SGD', '1.3412', 'SG-SR-9', 'ZR-INTL'],
  MYPKG: ['PKG', 'MY', 'MYR', '4.4710', 'MY-SST-8', 'MY-SST-8'],
  INNSA: ['NSA', 'IN', 'INR', '84.1200', 'IN-GST-18', 'IN-GST-18'],
  THLCH: ['LCH', 'TH', 'THB', '34.2500', 'TH-VAT-7', 'TH-VAT-7'],
};

/** USD -> local currency. */
export const USD_RATES: Readonly<Record<string, number>> = { SGD: 1.3412, INR: 84.12, MYR: 4.471, THB: 34.25 };
