export type Status = 'em_dia' | 'atraso_leve' | 'atraso_critico' | 'sem_dados';
export type System = 'Trier' | 'Alpha 7' | 'Eden' | 'Legado';
export type ContractStatus = 'Ativo' | 'Suspenso' | 'Inativo';

export interface Pharmacy {
  id: string;
  cnpj: string;
  name: string;
  storeNumber: string;
  associationCode: string;
  system: System;
  contractStatus: ContractStatus;
  lastDateRedshift: string | null;
  lastDateApi: string | null;
  daysLag: number | null;
  status: Status;
  lastAudit: string;
  recordsRedshift: number | null;
  recordsApi: number | null;
}

export interface AuditHistory {
  auditDate: string;
  lastDateRedshift: string | null;
  lastDateApi: string | null;
  daysLag: number | null;
}

export interface DayRecord {
  date: string;
  recordsRedshift: number;
  recordsApi: number;
  difference: number;
  presentIn: 'Ambos' | 'Somente Redshift' | 'Somente API';
}

export interface IntegrationError {
  id: string;
  cnpj: string;
  pharmacyName: string;
  origin: 'API' | 'Redshift';
  period: string;
  error: string;
  timestamp: string;
}

export const mockPharmacies: Pharmacy[] = [
  // ─── TRIER (14) ──────────────────────────────────────────────────────────────
  {
    id: 'trier-001', cnpj: '00.112.423/0001-01', name: 'Farmácia Drogalar', storeNumber: '001',
    associationCode: 'ASOC001', system: 'Trier', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1842, recordsApi: 1839,
  },
  {
    id: 'trier-002', cnpj: '00.112.423/0001-02', name: 'Farmácia Drogalar', storeNumber: '002',
    associationCode: 'ASOC001', system: 'Trier', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2103, recordsApi: 2098,
  },
  {
    id: 'trier-003', cnpj: '11.234.567/0001-01', name: 'Droga Total', storeNumber: '005',
    associationCode: 'ASOC002', system: 'Trier', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-12', lastDateApi: '2026-04-12', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 987, recordsApi: 984,
  },
  {
    id: 'trier-004', cnpj: '12.345.678/0001-01', name: 'Farmavida', storeNumber: '010',
    associationCode: 'ASOC003', system: 'Trier', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 3201, recordsApi: 3195,
  },
  {
    id: 'trier-005', cnpj: '13.456.789/0001-01', name: 'Farmavida', storeNumber: '011',
    associationCode: 'ASOC003', system: 'Trier', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-12', lastDateApi: '2026-04-12', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1560, recordsApi: 1558,
  },
  {
    id: 'trier-006', cnpj: '14.567.890/0001-01', name: 'Saúde Plus', storeNumber: '003',
    associationCode: 'ASOC004', system: 'Trier', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2780, recordsApi: 2776,
  },
  {
    id: 'trier-007', cnpj: '15.678.901/0001-01', name: 'Saúde Plus', storeNumber: '004',
    associationCode: 'ASOC004', system: 'Trier', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-11', lastDateApi: '2026-04-11', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1124, recordsApi: 1120,
  },
  {
    id: 'trier-008', cnpj: '16.789.012/0001-01', name: 'Bem Estar Farma', storeNumber: '007',
    associationCode: 'ASOC005', system: 'Trier', contractStatus: 'Suspenso',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-11', daysLag: 2, status: 'atraso_leve',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1905, recordsApi: 1643,
  },
  {
    id: 'trier-009', cnpj: '17.890.123/0001-01', name: 'Bem Estar Farma', storeNumber: '008',
    associationCode: 'ASOC005', system: 'Trier', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-12', daysLag: 1, status: 'atraso_leve',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2244, recordsApi: 2110,
  },
  {
    id: 'trier-010', cnpj: '18.901.234/0001-01', name: 'Pharma Centro', storeNumber: '002',
    associationCode: 'ASOC006', system: 'Trier', contractStatus: 'Inativo',
    lastDateRedshift: null, lastDateApi: null, daysLag: null, status: 'sem_dados',
    lastAudit: '13/04/2026 14:30', recordsRedshift: null, recordsApi: null,
  },
  {
    id: 'trier-011', cnpj: '19.012.345/0001-01', name: 'Droga Total', storeNumber: '006',
    associationCode: 'ASOC002', system: 'Trier', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1388, recordsApi: 1384,
  },
  {
    id: 'trier-012', cnpj: '19.123.456/0001-01', name: 'Farma Rede Norte', storeNumber: '018',
    associationCode: 'ASOC020', system: 'Trier', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-08', daysLag: 5, status: 'atraso_critico',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 3012, recordsApi: 1890,
  },
  {
    id: 'trier-013', cnpj: '19.234.567/0001-01', name: 'Farma Rede Norte', storeNumber: '019',
    associationCode: 'ASOC020', system: 'Trier', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2567, recordsApi: 2562,
  },
  {
    id: 'trier-014', cnpj: '19.345.678/0001-01', name: 'Pharma Centro', storeNumber: '003',
    associationCode: 'ASOC006', system: 'Trier', contractStatus: 'Suspenso',
    lastDateRedshift: null, lastDateApi: null, daysLag: null, status: 'sem_dados',
    lastAudit: '13/04/2026 14:30', recordsRedshift: null, recordsApi: null,
  },

  // ─── ALPHA 7 (18) ─────────────────────────────────────────────────────────
  {
    id: 'alpha7-001', cnpj: '20.112.423/0001-01', name: 'Drogaria Alpha', storeNumber: '001',
    associationCode: 'ASOC007', system: 'Alpha 7', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 4521, recordsApi: 4515,
  },
  {
    id: 'alpha7-002', cnpj: '20.112.423/0002-01', name: 'Drogaria Alpha', storeNumber: '002',
    associationCode: 'ASOC007', system: 'Alpha 7', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 3847, recordsApi: 3841,
  },
  {
    id: 'alpha7-003', cnpj: '21.234.567/0001-01', name: 'Farma Express', storeNumber: '003',
    associationCode: 'ASOC008', system: 'Alpha 7', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-12', lastDateApi: '2026-04-12', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1203, recordsApi: 1199,
  },
  {
    id: 'alpha7-004', cnpj: '22.345.678/0001-01', name: 'Farma Express', storeNumber: '004',
    associationCode: 'ASOC008', system: 'Alpha 7', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2988, recordsApi: 2981,
  },
  {
    id: 'alpha7-005', cnpj: '23.456.789/0001-01', name: 'Drogão Super', storeNumber: '012',
    associationCode: 'ASOC009', system: 'Alpha 7', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-11', lastDateApi: '2026-04-11', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 5102, recordsApi: 5094,
  },
  {
    id: 'alpha7-006', cnpj: '24.567.890/0001-01', name: 'Drogão Super', storeNumber: '013',
    associationCode: 'ASOC009', system: 'Alpha 7', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 4430, recordsApi: 4425,
  },
  {
    id: 'alpha7-007', cnpj: '25.678.901/0001-01', name: 'Panvel Alpha', storeNumber: '006',
    associationCode: 'ASOC010', system: 'Alpha 7', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-12', lastDateApi: '2026-04-12', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1876, recordsApi: 1872,
  },
  {
    id: 'alpha7-008', cnpj: '26.789.012/0001-01', name: 'Panvel Alpha', storeNumber: '007',
    associationCode: 'ASOC010', system: 'Alpha 7', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2341, recordsApi: 2337,
  },
  {
    id: 'alpha7-009', cnpj: '27.890.123/0001-01', name: 'Farmalife', storeNumber: '009',
    associationCode: 'ASOC011', system: 'Alpha 7', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-12', lastDateApi: '2026-04-12', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1654, recordsApi: 1649,
  },
  {
    id: 'alpha7-010', cnpj: '28.901.234/0001-01', name: 'Farmalife', storeNumber: '010',
    associationCode: 'ASOC011', system: 'Alpha 7', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2890, recordsApi: 2885,
  },
  {
    id: 'alpha7-011', cnpj: '29.012.345/0001-01', name: 'Genix Farma', storeNumber: '015',
    associationCode: 'ASOC012', system: 'Alpha 7', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-12', lastDateApi: '2026-04-12', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1122, recordsApi: 1120,
  },
  {
    id: 'alpha7-012', cnpj: '30.123.456/0001-01', name: 'Drogaria Alpha', storeNumber: '020',
    associationCode: 'ASOC007', system: 'Alpha 7', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-10', daysLag: 3, status: 'atraso_leve',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 3560, recordsApi: 2870,
  },
  {
    id: 'alpha7-013', cnpj: '31.234.567/0001-01', name: 'Farma Express', storeNumber: '021',
    associationCode: 'ASOC008', system: 'Alpha 7', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-12', daysLag: 1, status: 'atraso_leve',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1980, recordsApi: 1840,
  },
  {
    id: 'alpha7-014', cnpj: '32.345.678/0001-01', name: 'Genix Farma', storeNumber: '022',
    associationCode: 'ASOC012', system: 'Alpha 7', contractStatus: 'Suspenso',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-11', daysLag: 2, status: 'atraso_leve',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2105, recordsApi: 1780,
  },
  {
    id: 'alpha7-015', cnpj: '33.456.789/0001-01', name: 'Panvel Alpha', storeNumber: '025',
    associationCode: 'ASOC010', system: 'Alpha 7', contractStatus: 'Suspenso',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-05', daysLag: 8, status: 'atraso_critico',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 4780, recordsApi: 2340,
  },
  {
    id: 'alpha7-016', cnpj: '34.567.890/0001-01', name: 'Drogão Super', storeNumber: '030',
    associationCode: 'ASOC009', system: 'Alpha 7', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 3344, recordsApi: 3339,
  },
  {
    id: 'alpha7-017', cnpj: '35.678.901/0001-01', name: 'Farmalife', storeNumber: '031',
    associationCode: 'ASOC011', system: 'Alpha 7', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-06', daysLag: 7, status: 'atraso_critico',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2780, recordsApi: 1120,
  },
  {
    id: 'alpha7-018', cnpj: '36.789.012/0001-01', name: 'Farma Express', storeNumber: '032',
    associationCode: 'ASOC008', system: 'Alpha 7', contractStatus: 'Inativo',
    lastDateRedshift: null, lastDateApi: null, daysLag: null, status: 'sem_dados',
    lastAudit: '13/04/2026 14:30', recordsRedshift: null, recordsApi: null,
  },

  // ─── EDEN (22) ────────────────────────────────────────────────────────────
  {
    id: 'eden-001', cnpj: '40.112.423/0001-01', name: 'Eden Farmácias', storeNumber: '001',
    associationCode: 'ASOC013', system: 'Eden', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2890, recordsApi: 2885,
  },
  {
    id: 'eden-002', cnpj: '40.112.423/0002-01', name: 'Eden Farmácias', storeNumber: '002',
    associationCode: 'ASOC013', system: 'Eden', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-12', lastDateApi: '2026-04-12', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1745, recordsApi: 1741,
  },
  {
    id: 'eden-003', cnpj: '41.234.567/0001-01', name: 'Drogasil Eden', storeNumber: '003',
    associationCode: 'ASOC014', system: 'Eden', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 3120, recordsApi: 3114,
  },
  {
    id: 'eden-004', cnpj: '42.345.678/0001-01', name: 'Drogasil Eden', storeNumber: '004',
    associationCode: 'ASOC014', system: 'Eden', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-11', lastDateApi: '2026-04-11', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2210, recordsApi: 2206,
  },
  {
    id: 'eden-005', cnpj: '43.456.789/0001-01', name: 'Rede Verde Farma', storeNumber: '005',
    associationCode: 'ASOC015', system: 'Legado', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1890, recordsApi: 1887,
  },
  {
    id: 'eden-006', cnpj: '44.567.890/0001-01', name: 'Rede Verde Farma', storeNumber: '006',
    associationCode: 'ASOC015', system: 'Legado', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-12', lastDateApi: '2026-04-12', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2045, recordsApi: 2041,
  },
  {
    id: 'eden-007', cnpj: '45.678.901/0001-01', name: 'Pharma Eden', storeNumber: '007',
    associationCode: 'ASOC016', system: 'Eden', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 3456, recordsApi: 3450,
  },
  {
    id: 'eden-008', cnpj: '46.789.012/0001-01', name: 'Pharma Eden', storeNumber: '008',
    associationCode: 'ASOC016', system: 'Eden', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-12', lastDateApi: '2026-04-12', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2780, recordsApi: 2775,
  },
  {
    id: 'eden-009', cnpj: '47.890.123/0001-01', name: 'Drogamed Eden', storeNumber: '009',
    associationCode: 'ASOC017', system: 'Eden', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1560, recordsApi: 1555,
  },
  {
    id: 'eden-010', cnpj: '48.901.234/0001-01', name: 'Drogamed Eden', storeNumber: '010',
    associationCode: 'ASOC017', system: 'Eden', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-12', lastDateApi: '2026-04-12', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2330, recordsApi: 2325,
  },
  {
    id: 'eden-011', cnpj: '49.012.345/0001-01', name: 'Saúde Eden', storeNumber: '011',
    associationCode: 'ASOC018', system: 'Legado', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-11', lastDateApi: '2026-04-11', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1120, recordsApi: 1117,
  },
  {
    id: 'eden-012', cnpj: '50.123.456/0001-01', name: 'Saúde Eden', storeNumber: '012',
    associationCode: 'ASOC018', system: 'Legado', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1890, recordsApi: 1885,
  },
  {
    id: 'eden-013', cnpj: '51.234.567/0001-01', name: 'Farma Total Eden', storeNumber: '013',
    associationCode: 'ASOC019', system: 'Eden', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-12', lastDateApi: '2026-04-12', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2450, recordsApi: 2445,
  },
  {
    id: 'eden-014', cnpj: '52.345.678/0001-01', name: 'Farma Total Eden', storeNumber: '014',
    associationCode: 'ASOC019', system: 'Eden', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 3100, recordsApi: 3094,
  },
  {
    id: 'eden-015', cnpj: '53.456.789/0001-01', name: 'Eden Farmácias', storeNumber: '030',
    associationCode: 'ASOC013', system: 'Eden', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-11', daysLag: 2, status: 'atraso_leve',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2660, recordsApi: 2150,
  },
  {
    id: 'eden-016', cnpj: '54.567.890/0001-01', name: 'Drogasil Eden', storeNumber: '031',
    associationCode: 'ASOC014', system: 'Eden', contractStatus: 'Suspenso',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-10', daysLag: 3, status: 'atraso_leve',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 3210, recordsApi: 2430,
  },
  {
    id: 'eden-017', cnpj: '55.678.901/0001-01', name: 'Rede Verde Farma', storeNumber: '032',
    associationCode: 'ASOC015', system: 'Legado', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-12', daysLag: 1, status: 'atraso_leve',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1980, recordsApi: 1850,
  },
  {
    id: 'eden-018', cnpj: '56.789.012/0001-01', name: 'Pharma Eden', storeNumber: '035',
    associationCode: 'ASOC016', system: 'Eden', contractStatus: 'Suspenso',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-07', daysLag: 6, status: 'atraso_critico',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 4120, recordsApi: 1650,
  },
  {
    id: 'eden-019', cnpj: '57.890.123/0001-01', name: 'Drogamed Eden', storeNumber: '036',
    associationCode: 'ASOC017', system: 'Eden', contractStatus: 'Inativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-04', daysLag: 9, status: 'atraso_critico',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 5340, recordsApi: 1200,
  },
  {
    id: 'eden-020', cnpj: '58.901.234/0001-01', name: 'Saúde Eden', storeNumber: '040',
    associationCode: 'ASOC018', system: 'Legado', contractStatus: 'Inativo',
    lastDateRedshift: null, lastDateApi: null, daysLag: null, status: 'sem_dados',
    lastAudit: '13/04/2026 14:30', recordsRedshift: null, recordsApi: null,
  },
  {
    id: 'eden-021', cnpj: '59.012.345/0001-01', name: 'Farma Total Eden', storeNumber: '041',
    associationCode: 'ASOC019', system: 'Eden', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-09', daysLag: 4, status: 'atraso_critico',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2890, recordsApi: 1340,
  },
  {
    id: 'eden-022', cnpj: '59.123.456/0001-01', name: 'Eden Farmácias', storeNumber: '042',
    associationCode: 'ASOC013', system: 'Eden', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1670, recordsApi: 1665,
  },

  // ─── LEGADO (16) ──────────────────────────────────────────────────────────
  {
    id: 'legado-001', cnpj: '60.112.423/0001-01', name: 'Legado Farma', storeNumber: '001',
    associationCode: 'ASOC021', system: 'Legado', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1230, recordsApi: 1226,
  },
  {
    id: 'legado-002', cnpj: '61.234.567/0001-01', name: 'Drogaria Legado', storeNumber: '002',
    associationCode: 'ASOC022', system: 'Legado', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-12', lastDateApi: '2026-04-12', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 890, recordsApi: 887,
  },
  {
    id: 'legado-003', cnpj: '62.345.678/0001-01', name: 'Drogaria Legado', storeNumber: '003',
    associationCode: 'ASOC022', system: 'Legado', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1560, recordsApi: 1555,
  },
  {
    id: 'legado-004', cnpj: '63.456.789/0001-01', name: 'Farma Sul', storeNumber: '004',
    associationCode: 'ASOC023', system: 'Legado', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-11', lastDateApi: '2026-04-11', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2340, recordsApi: 2335,
  },
  {
    id: 'legado-005', cnpj: '64.567.890/0001-01', name: 'Farma Sul', storeNumber: '005',
    associationCode: 'ASOC023', system: 'Legado', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1780, recordsApi: 1775,
  },
  {
    id: 'legado-006', cnpj: '65.678.901/0001-01', name: 'Botica Central', storeNumber: '006',
    associationCode: 'ASOC024', system: 'Legado', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-12', lastDateApi: '2026-04-12', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 3210, recordsApi: 3204,
  },
  {
    id: 'legado-007', cnpj: '66.789.012/0001-01', name: 'Botica Central', storeNumber: '007',
    associationCode: 'ASOC024', system: 'Legado', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2890, recordsApi: 2884,
  },
  {
    id: 'legado-008', cnpj: '67.890.123/0001-01', name: 'Legado Farma', storeNumber: '008',
    associationCode: 'ASOC021', system: 'Legado', contractStatus: 'Suspenso',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-12', daysLag: 1, status: 'atraso_leve',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1450, recordsApi: 1320,
  },
  {
    id: 'legado-009', cnpj: '68.901.234/0001-01', name: 'Drogaria Legado', storeNumber: '009',
    associationCode: 'ASOC022', system: 'Legado', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-10', daysLag: 3, status: 'atraso_leve',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2100, recordsApi: 1560,
  },
  {
    id: 'legado-010', cnpj: '69.012.345/0001-01', name: 'Farma Sul', storeNumber: '010',
    associationCode: 'ASOC023', system: 'Legado', contractStatus: 'Suspenso',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-11', daysLag: 2, status: 'atraso_leve',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1780, recordsApi: 1450,
  },
  {
    id: 'legado-011', cnpj: '70.123.456/0001-01', name: 'Botica Central', storeNumber: '011',
    associationCode: 'ASOC024', system: 'Legado', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-06', daysLag: 7, status: 'atraso_critico',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 3450, recordsApi: 1230,
  },
  {
    id: 'legado-012', cnpj: '71.234.567/0001-01', name: 'Legado Farma', storeNumber: '012',
    associationCode: 'ASOC021', system: 'Legado', contractStatus: 'Inativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-03', daysLag: 10, status: 'atraso_critico',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 4120, recordsApi: 890,
  },
  {
    id: 'legado-013', cnpj: '72.345.678/0001-01', name: 'Farma Sul', storeNumber: '013',
    associationCode: 'ASOC023', system: 'Legado', contractStatus: 'Inativo',
    lastDateRedshift: null, lastDateApi: null, daysLag: null, status: 'sem_dados',
    lastAudit: '13/04/2026 14:30', recordsRedshift: null, recordsApi: null,
  },
  {
    id: 'legado-014', cnpj: '73.456.789/0001-01', name: 'Botica Central', storeNumber: '014',
    associationCode: 'ASOC024', system: 'Legado', contractStatus: 'Inativo',
    lastDateRedshift: null, lastDateApi: null, daysLag: null, status: 'sem_dados',
    lastAudit: '13/04/2026 14:30', recordsRedshift: null, recordsApi: null,
  },
  {
    id: 'legado-015', cnpj: '74.567.890/0001-01', name: 'Drogaria Legado', storeNumber: '015',
    associationCode: 'ASOC022', system: 'Legado', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-13', lastDateApi: '2026-04-13', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 1340, recordsApi: 1337,
  },
  {
    id: 'legado-016', cnpj: '75.678.901/0001-01', name: 'Legado Farma', storeNumber: '016',
    associationCode: 'ASOC021', system: 'Legado', contractStatus: 'Ativo',
    lastDateRedshift: '2026-04-12', lastDateApi: '2026-04-12', daysLag: 0, status: 'em_dia',
    lastAudit: '13/04/2026 14:30', recordsRedshift: 2110, recordsApi: 2105,
  },
];

// Generate audit history for the drawer line chart
export function generateAuditHistory(pharmacy: Pharmacy): AuditHistory[] {
  const history: AuditHistory[] = [];
  const today = new Date('2026-04-13');

  if (pharmacy.status === 'sem_dados') {
    return Array.from({ length: 10 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (9 - i) * 2);
      return {
        auditDate: d.toLocaleDateString('pt-BR'),
        lastDateRedshift: null,
        lastDateApi: null,
        daysLag: null,
      };
    });
  }

  const baseApiDate = new Date(pharmacy.lastDateApi!);
  const currentLag = pharmacy.daysLag ?? 0;

  for (let i = 9; i >= 0; i--) {
    const auditDate = new Date(today);
    auditDate.setDate(auditDate.getDate() - i * 2);

    const lagProgress = Math.max(0, Math.round(currentLag * (1 - i / 10)));

    const apiDate = new Date(baseApiDate);
    apiDate.setDate(apiDate.getDate() - Math.round((i * 1.5)));

    const redshiftDate = new Date(apiDate);
    redshiftDate.setDate(redshiftDate.getDate() + lagProgress);

    history.push({
      auditDate: auditDate.toLocaleDateString('pt-BR'),
      lastDateRedshift: redshiftDate.toLocaleDateString('pt-BR'),
      lastDateApi: apiDate.toLocaleDateString('pt-BR'),
      daysLag: lagProgress,
    });
  }
  return history;
}

// Generate day-by-day data for the drawer table
export function generateDayData(pharmacy: Pharmacy): DayRecord[] {
  if (pharmacy.status === 'sem_dados') return [];
  const records: DayRecord[] = [];
  const today = new Date('2026-04-13');

  for (let i = 0; i < 15; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('pt-BR');
    const dLag = pharmacy.daysLag ?? 0;

    let presentIn: DayRecord['presentIn'] = 'Ambos';
    let recRedshift = Math.floor(Math.random() * 200) + 80;
    let recApi = recRedshift - Math.floor(Math.random() * 10);

    if (i < dLag) {
      presentIn = 'Somente Redshift';
      recRedshift = Math.floor(Math.random() * 200) + 80;
      recApi = 0;
    } else if (i === dLag && dLag > 0) {
      presentIn = 'Ambos';
    }

    records.push({
      date: dateStr,
      recordsRedshift: recRedshift,
      recordsApi: recApi,
      difference: recRedshift - recApi,
      presentIn,
    });
  }
  return records;
}

export const mockErrors: IntegrationError[] = [
  {
    id: 'err-001',
    cnpj: '18.901.234/0001-01',
    pharmacyName: 'Pharma Centro',
    origin: 'API',
    period: '01/04/2026 a 13/04/2026',
    error: 'CNPJ não encontrado na base Farmarcas (404)',
    timestamp: '13/04/2026 14:28',
  },
  {
    id: 'err-002',
    cnpj: '58.901.234/0001-01',
    pharmacyName: 'Saúde Eden',
    origin: 'API',
    period: '01/04/2026 a 13/04/2026',
    error: 'Timeout na requisição (>30s) — endpoint /v2/bc/obter-vendas',
    timestamp: '13/04/2026 14:29',
  },
  {
    id: 'err-003',
    cnpj: '57.890.123/0001-01',
    pharmacyName: 'Drogamed Eden',
    origin: 'API',
    period: '04/04/2026 a 06/04/2026',
    error: 'Rate limit atingido (HTTP 429) — aguardando retry',
    timestamp: '13/04/2026 14:15',
  },
  {
    id: 'err-004',
    cnpj: '33.456.789/0001-01',
    pharmacyName: 'Panvel Alpha',
    origin: 'Redshift',
    period: '05/04/2026 a 08/04/2026',
    error: 'Query timeout no Redshift (>120s) — tabela associacao.vendas',
    timestamp: '13/04/2026 13:55',
  },
  {
    id: 'err-005',
    cnpj: '56.789.012/0001-01',
    pharmacyName: 'Pharma Eden',
    origin: 'API',
    period: '07/04/2026 a 10/04/2026',
    error: 'Resposta malformada (JSON inválido) no campo data_emissao',
    timestamp: '13/04/2026 14:02',
  },
];
