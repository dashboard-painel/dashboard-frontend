import { useState, useMemo } from 'react';
import { Header } from './components/dashboard/Header';
import { Filters } from './components/dashboard/FilterBar';
import { KPICards } from './components/dashboard/KPICards';
import { MainTable } from './components/dashboard/MainTable';
import { DetailDrawer } from './components/dashboard/DetailDrawer';
import { ChartsSection } from './components/dashboard/ChartsSection';
import { mockPharmacies, Pharmacy } from './data/mockData';
import { lightTheme, darkTheme, Theme } from './theme';

const defaultFilters: Filters = {
  statuses: ['em_dia', 'atraso_leve', 'atraso_critico', 'sem_dados'],
  cnpjs: [],
  associationCodes: [],
};

export default function App() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme: Theme = isDarkMode ? darkTheme : lightTheme;

  const filteredData = useMemo(() => {
    return mockPharmacies.filter((p) => {
      if (!filters.statuses.includes(p.status)) return false;
      if (filters.cnpjs.length > 0 && !filters.cnpjs.includes(p.cnpj)) return false;
      if (filters.associationCodes.length > 0 && !filters.associationCodes.includes(p.associationCode)) return false;
      return true;
    });
  }, [filters]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        overflowX: 'hidden',
        background: theme.bg.main,
        color: theme.text.primary,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <Header theme={theme} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          paddingTop: '20px',
          paddingBottom: '24px',
        }}
      >
        <KPICards data={filteredData} theme={theme} />
        <ChartsSection data={filteredData} theme={theme} />
        <MainTable
          data={filteredData}
          onSelectPharmacy={setSelectedPharmacy}
          onFilterChange={setFilters}
          theme={theme}
        />
      </main>

      {selectedPharmacy && (
        <DetailDrawer
          pharmacy={selectedPharmacy}
          onClose={() => setSelectedPharmacy(null)}
          theme={theme}
        />
      )}
    </div>
  );
}
