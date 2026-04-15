export type Status = 'em_dia' | 'atraso_leve' | 'atraso_critico' | 'sem_dados';
export type TagValue = 'OK' | 'ATRASADO' | 'CRITICO';

export interface LayerStatus {
  status: TagValue;
  lastSaleDate: string; // ISO date string e.g. "2026-04-14"
}

export interface Pharmacy {
  id: string;
  cnpj: string;
  name: string;
  storeNumber: string;
  associationCode: string;
  status: Status;
  gold: LayerStatus;
  silver: LayerStatus;
  api: LayerStatus;
}

// Reference date: 2026-04-15
// OK        = lastSaleDate is today (2026-04-15) or yesterday (2026-04-14)      → 0–1 day ago
// ATRASADO  = lastSaleDate is 2026-04-13 or 2026-04-12                          → 2–3 days ago
// CRITICO   = lastSaleDate is 2026-04-11 or earlier                             → 4+ days ago

export const mockPharmacies: Pharmacy[] = [
  // ─── TRIER (14) ──────────────────────────────────────────────────────────────
  {
    id: 'trier-001', cnpj: '00.112.423/0001-01', name: 'Farmácia Drogalar', storeNumber: '001',
    associationCode: 'ASOC001', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'trier-002', cnpj: '00.112.423/0001-02', name: 'Farmácia Drogalar', storeNumber: '002',
    associationCode: 'ASOC001', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'trier-003', cnpj: '11.234.567/0001-01', name: 'Droga Total', storeNumber: '005',
    associationCode: 'ASOC002', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
  },
  {
    id: 'trier-004', cnpj: '12.345.678/0001-01', name: 'Farmavida', storeNumber: '010',
    associationCode: 'ASOC003', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'trier-005', cnpj: '13.456.789/0001-01', name: 'Farmavida', storeNumber: '011',
    associationCode: 'ASOC003', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'trier-006', cnpj: '14.567.890/0001-01', name: 'Saúde Plus', storeNumber: '003',
    associationCode: 'ASOC004', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'trier-007', cnpj: '15.678.901/0001-01', name: 'Saúde Plus', storeNumber: '004',
    associationCode: 'ASOC004', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'trier-008', cnpj: '16.789.012/0001-01', name: 'Bem Estar Farma', storeNumber: '007',
    associationCode: 'ASOC005', status: 'atraso_leve',
    gold:   { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
  },
  {
    id: 'trier-009', cnpj: '17.890.123/0001-01', name: 'Bem Estar Farma', storeNumber: '008',
    associationCode: 'ASOC005', status: 'atraso_leve',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
    api:    { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
  },
  {
    id: 'trier-010', cnpj: '18.901.234/0001-01', name: 'Pharma Centro', storeNumber: '002',
    associationCode: 'ASOC006', status: 'sem_dados',
    gold:   { status: 'CRITICO',  lastSaleDate: '2026-04-09' },
    silver: { status: 'CRITICO',  lastSaleDate: '2026-04-08' },
    api:    { status: 'CRITICO',  lastSaleDate: '2026-04-07' },
  },
  {
    id: 'trier-011', cnpj: '19.012.345/0001-01', name: 'Droga Total', storeNumber: '006',
    associationCode: 'ASOC002', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'trier-012', cnpj: '19.123.456/0001-01', name: 'Farma Rede Norte', storeNumber: '018',
    associationCode: 'ASOC020', status: 'atraso_critico',
    gold:   { status: 'CRITICO',  lastSaleDate: '2026-04-10' },
    silver: { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
    api:    { status: 'CRITICO',  lastSaleDate: '2026-04-09' },
  },
  {
    id: 'trier-013', cnpj: '19.234.567/0001-01', name: 'Farma Rede Norte', storeNumber: '019',
    associationCode: 'ASOC020', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'trier-014', cnpj: '19.345.678/0001-01', name: 'Pharma Centro', storeNumber: '003',
    associationCode: 'ASOC006', status: 'sem_dados',
    gold:   { status: 'CRITICO',  lastSaleDate: '2026-04-08' },
    silver: { status: 'CRITICO',  lastSaleDate: '2026-04-07' },
    api:    { status: 'CRITICO',  lastSaleDate: '2026-04-09' },
  },

  // ─── ALPHA 7 (18) ─────────────────────────────────────────────────────────
  {
    id: 'alpha7-001', cnpj: '20.112.423/0001-01', name: 'Drogaria Alpha', storeNumber: '001',
    associationCode: 'ASOC007', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'alpha7-002', cnpj: '20.112.423/0002-01', name: 'Drogaria Alpha', storeNumber: '002',
    associationCode: 'ASOC007', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'alpha7-003', cnpj: '21.234.567/0001-01', name: 'Farma Express', storeNumber: '003',
    associationCode: 'ASOC008', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'alpha7-004', cnpj: '22.345.678/0001-01', name: 'Farma Express', storeNumber: '004',
    associationCode: 'ASOC008', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'alpha7-005', cnpj: '23.456.789/0001-01', name: 'Drogão Super', storeNumber: '012',
    associationCode: 'ASOC009', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'alpha7-006', cnpj: '24.567.890/0001-01', name: 'Drogão Super', storeNumber: '013',
    associationCode: 'ASOC009', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
  },
  {
    id: 'alpha7-007', cnpj: '25.678.901/0001-01', name: 'Panvel Alpha', storeNumber: '006',
    associationCode: 'ASOC010', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'alpha7-008', cnpj: '26.789.012/0001-01', name: 'Panvel Alpha', storeNumber: '007',
    associationCode: 'ASOC010', status: 'em_dia',
    gold:   { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'alpha7-009', cnpj: '27.890.123/0001-01', name: 'Farmalife', storeNumber: '009',
    associationCode: 'ASOC011', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'alpha7-010', cnpj: '28.901.234/0001-01', name: 'Farmalife', storeNumber: '010',
    associationCode: 'ASOC011', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'alpha7-011', cnpj: '29.012.345/0001-01', name: 'Genix Farma', storeNumber: '015',
    associationCode: 'ASOC012', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'alpha7-012', cnpj: '30.123.456/0001-01', name: 'Drogaria Alpha', storeNumber: '020',
    associationCode: 'ASOC007', status: 'atraso_leve',
    gold:   { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
  },
  {
    id: 'alpha7-013', cnpj: '31.234.567/0001-01', name: 'Farma Express', storeNumber: '021',
    associationCode: 'ASOC008', status: 'atraso_leve',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
    api:    { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
  },
  {
    id: 'alpha7-014', cnpj: '32.345.678/0001-01', name: 'Genix Farma', storeNumber: '022',
    associationCode: 'ASOC012', status: 'atraso_leve',
    gold:   { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
    silver: { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'alpha7-015', cnpj: '33.456.789/0001-01', name: 'Panvel Alpha', storeNumber: '025',
    associationCode: 'ASOC010', status: 'atraso_critico',
    gold:   { status: 'CRITICO',  lastSaleDate: '2026-04-10' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'CRITICO',  lastSaleDate: '2026-04-09' },
  },
  {
    id: 'alpha7-016', cnpj: '34.567.890/0001-01', name: 'Drogão Super', storeNumber: '030',
    associationCode: 'ASOC009', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'alpha7-017', cnpj: '35.678.901/0001-01', name: 'Farmalife', storeNumber: '031',
    associationCode: 'ASOC011', status: 'atraso_critico',
    gold:   { status: 'CRITICO',  lastSaleDate: '2026-04-08' },
    silver: { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
    api:    { status: 'CRITICO',  lastSaleDate: '2026-04-07' },
  },
  {
    id: 'alpha7-018', cnpj: '36.789.012/0001-01', name: 'Farma Express', storeNumber: '032',
    associationCode: 'ASOC008', status: 'sem_dados',
    gold:   { status: 'CRITICO',  lastSaleDate: '2026-04-09' },
    silver: { status: 'CRITICO',  lastSaleDate: '2026-04-08' },
    api:    { status: 'CRITICO',  lastSaleDate: '2026-04-07' },
  },

  // ─── EDEN (22) ────────────────────────────────────────────────────────────
  {
    id: 'eden-001', cnpj: '40.112.423/0001-01', name: 'Eden Farmácias', storeNumber: '001',
    associationCode: 'ASOC013', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'eden-002', cnpj: '40.112.423/0002-01', name: 'Eden Farmácias', storeNumber: '002',
    associationCode: 'ASOC013', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'eden-003', cnpj: '41.234.567/0001-01', name: 'Drogasil Eden', storeNumber: '003',
    associationCode: 'ASOC014', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'eden-004', cnpj: '42.345.678/0001-01', name: 'Drogasil Eden', storeNumber: '004',
    associationCode: 'ASOC014', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'eden-005', cnpj: '43.456.789/0001-01', name: 'Rede Verde Farma', storeNumber: '005',
    associationCode: 'ASOC015', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'eden-006', cnpj: '44.567.890/0001-01', name: 'Rede Verde Farma', storeNumber: '006',
    associationCode: 'ASOC015', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
  },
  {
    id: 'eden-007', cnpj: '45.678.901/0001-01', name: 'Pharma Eden', storeNumber: '007',
    associationCode: 'ASOC016', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'eden-008', cnpj: '46.789.012/0001-01', name: 'Pharma Eden', storeNumber: '008',
    associationCode: 'ASOC016', status: 'em_dia',
    gold:   { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'eden-009', cnpj: '47.890.123/0001-01', name: 'Drogamed Eden', storeNumber: '009',
    associationCode: 'ASOC017', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'eden-010', cnpj: '48.901.234/0001-01', name: 'Drogamed Eden', storeNumber: '010',
    associationCode: 'ASOC017', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'eden-011', cnpj: '49.012.345/0001-01', name: 'Saúde Eden', storeNumber: '011',
    associationCode: 'ASOC018', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
    api:    { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
  },
  {
    id: 'eden-012', cnpj: '50.123.456/0001-01', name: 'Saúde Eden', storeNumber: '012',
    associationCode: 'ASOC018', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'eden-013', cnpj: '51.234.567/0001-01', name: 'Farma Total Eden', storeNumber: '013',
    associationCode: 'ASOC019', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'eden-014', cnpj: '52.345.678/0001-01', name: 'Farma Total Eden', storeNumber: '014',
    associationCode: 'ASOC019', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'eden-015', cnpj: '53.456.789/0001-01', name: 'Eden Farmácias', storeNumber: '030',
    associationCode: 'ASOC013', status: 'atraso_leve',
    gold:   { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
  },
  {
    id: 'eden-016', cnpj: '54.567.890/0001-01', name: 'Drogasil Eden', storeNumber: '031',
    associationCode: 'ASOC014', status: 'atraso_leve',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
    api:    { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
  },
  {
    id: 'eden-017', cnpj: '55.678.901/0001-01', name: 'Rede Verde Farma', storeNumber: '032',
    associationCode: 'ASOC015', status: 'atraso_leve',
    gold:   { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
    silver: { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'eden-018', cnpj: '56.789.012/0001-01', name: 'Pharma Eden', storeNumber: '035',
    associationCode: 'ASOC016', status: 'atraso_critico',
    gold:   { status: 'CRITICO',  lastSaleDate: '2026-04-09' },
    silver: { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
    api:    { status: 'CRITICO',  lastSaleDate: '2026-04-08' },
  },
  {
    id: 'eden-019', cnpj: '57.890.123/0001-01', name: 'Drogamed Eden', storeNumber: '036',
    associationCode: 'ASOC017', status: 'atraso_critico',
    gold:   { status: 'CRITICO',  lastSaleDate: '2026-04-10' },
    silver: { status: 'CRITICO',  lastSaleDate: '2026-04-09' },
    api:    { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
  },
  {
    id: 'eden-020', cnpj: '58.901.234/0001-01', name: 'Saúde Eden', storeNumber: '040',
    associationCode: 'ASOC018', status: 'sem_dados',
    gold:   { status: 'CRITICO',  lastSaleDate: '2026-04-07' },
    silver: { status: 'CRITICO',  lastSaleDate: '2026-04-08' },
    api:    { status: 'CRITICO',  lastSaleDate: '2026-04-09' },
  },
  {
    id: 'eden-021', cnpj: '59.012.345/0001-01', name: 'Farma Total Eden', storeNumber: '041',
    associationCode: 'ASOC019', status: 'atraso_critico',
    gold:   { status: 'CRITICO',  lastSaleDate: '2026-04-11' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'CRITICO',  lastSaleDate: '2026-04-10' },
  },
  {
    id: 'eden-022', cnpj: '59.123.456/0001-01', name: 'Eden Farmácias', storeNumber: '042',
    associationCode: 'ASOC013', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },

  // ─── LEGADO (16) ──────────────────────────────────────────────────────────
  {
    id: 'legado-001', cnpj: '60.112.423/0001-01', name: 'Legado Farma', storeNumber: '001',
    associationCode: 'ASOC021', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'legado-002', cnpj: '61.234.567/0001-01', name: 'Drogaria Legado', storeNumber: '002',
    associationCode: 'ASOC022', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'legado-003', cnpj: '62.345.678/0001-01', name: 'Drogaria Legado', storeNumber: '003',
    associationCode: 'ASOC022', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'legado-004', cnpj: '63.456.789/0001-01', name: 'Farma Sul', storeNumber: '004',
    associationCode: 'ASOC023', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'legado-005', cnpj: '64.567.890/0001-01', name: 'Farma Sul', storeNumber: '005',
    associationCode: 'ASOC023', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
  },
  {
    id: 'legado-006', cnpj: '65.678.901/0001-01', name: 'Botica Central', storeNumber: '006',
    associationCode: 'ASOC024', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'legado-007', cnpj: '66.789.012/0001-01', name: 'Botica Central', storeNumber: '007',
    associationCode: 'ASOC024', status: 'em_dia',
    gold:   { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
  {
    id: 'legado-008', cnpj: '67.890.123/0001-01', name: 'Legado Farma', storeNumber: '008',
    associationCode: 'ASOC021', status: 'atraso_leve',
    gold:   { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
  },
  {
    id: 'legado-009', cnpj: '68.901.234/0001-01', name: 'Drogaria Legado', storeNumber: '009',
    associationCode: 'ASOC022', status: 'atraso_leve',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
    api:    { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
  },
  {
    id: 'legado-010', cnpj: '69.012.345/0001-01', name: 'Farma Sul', storeNumber: '010',
    associationCode: 'ASOC023', status: 'atraso_leve',
    gold:   { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
    silver: { status: 'ATRASADO', lastSaleDate: '2026-04-12' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'legado-011', cnpj: '70.123.456/0001-01', name: 'Botica Central', storeNumber: '011',
    associationCode: 'ASOC024', status: 'atraso_critico',
    gold:   { status: 'CRITICO',  lastSaleDate: '2026-04-09' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'CRITICO',  lastSaleDate: '2026-04-08' },
  },
  {
    id: 'legado-012', cnpj: '71.234.567/0001-01', name: 'Legado Farma', storeNumber: '012',
    associationCode: 'ASOC021', status: 'atraso_critico',
    gold:   { status: 'CRITICO',  lastSaleDate: '2026-04-10' },
    silver: { status: 'CRITICO',  lastSaleDate: '2026-04-09' },
    api:    { status: 'ATRASADO', lastSaleDate: '2026-04-13' },
  },
  {
    id: 'legado-013', cnpj: '72.345.678/0001-01', name: 'Farma Sul', storeNumber: '013',
    associationCode: 'ASOC023', status: 'sem_dados',
    gold:   { status: 'CRITICO',  lastSaleDate: '2026-04-07' },
    silver: { status: 'CRITICO',  lastSaleDate: '2026-04-08' },
    api:    { status: 'CRITICO',  lastSaleDate: '2026-04-09' },
  },
  {
    id: 'legado-014', cnpj: '73.456.789/0001-01', name: 'Botica Central', storeNumber: '014',
    associationCode: 'ASOC024', status: 'sem_dados',
    gold:   { status: 'CRITICO',  lastSaleDate: '2026-04-08' },
    silver: { status: 'CRITICO',  lastSaleDate: '2026-04-07' },
    api:    { status: 'CRITICO',  lastSaleDate: '2026-04-09' },
  },
  {
    id: 'legado-015', cnpj: '74.567.890/0001-01', name: 'Drogaria Legado', storeNumber: '015',
    associationCode: 'ASOC022', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-14' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-15' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-14' },
  },
  {
    id: 'legado-016', cnpj: '75.678.901/0001-01', name: 'Legado Farma', storeNumber: '016',
    associationCode: 'ASOC021', status: 'em_dia',
    gold:   { status: 'OK',       lastSaleDate: '2026-04-15' },
    silver: { status: 'OK',       lastSaleDate: '2026-04-14' },
    api:    { status: 'OK',       lastSaleDate: '2026-04-15' },
  },
];
