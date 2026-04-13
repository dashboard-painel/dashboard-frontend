export interface Theme {
  // Background colors
  bg: {
    main: string;
    card: string;
    header: string;
    hover: string;
    alt: string;
  };
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  // Border colors
  border: {
    main: string;
    light: string;
    dark: string;
  };
  // Status colors (same for both themes)
  status: {
    success: string;
    warning: string;
    error: string;
    neutral: string;
  };
}

export const lightTheme: Theme = {
  bg: {
    main: '#EEF2F7',
    card: '#ffffff',
    header: '#0E3D6E',
    hover: '#F8FAFC',
    alt: '#F8FAFC',
  },
  text: {
    primary: '#1A2B3C',
    secondary: '#475569',
    tertiary: '#94A3B8',
    inverse: '#ffffff',
  },
  border: {
    main: '#E2E8F0',
    light: '#F1F5F9',
    dark: '#D1DCE5',
  },
  status: {
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    neutral: '#64748B',
  },
};

export const darkTheme: Theme = {
  bg: {
    main: '#0F1419',
    card: '#1A1D2E',
    header: '#1A1D2E',
    hover: '#252836',
    alt: '#1F2230',
  },
  text: {
    primary: '#E2E8F0',
    secondary: '#94A3B8',
    tertiary: '#64748B',
    inverse: '#ffffff',
  },
  border: {
    main: '#2E3347',
    light: '#252836',
    dark: '#3D4258',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    neutral: '#6B7280',
  },
};
