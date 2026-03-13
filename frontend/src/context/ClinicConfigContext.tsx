import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axiosInstance from '../config/axios';

interface ClinicSettings {
  appointmentDuration: number;
  businessHours: {
    morning: { start: string; end: string; enabled: boolean };
    afternoon: { start: string; end: string; enabled: boolean };
  };
  sobreturnoHours: {
    morning: { start: string; end: string; enabled: boolean };
    afternoon: { start: string; end: string; enabled: boolean };
  };
}

interface ClinicConfigContextType {
  socialWorks: string[];
  settings: ClinicSettings | null;
  clinicName: string;
}

const DEFAULT_SOCIAL_WORKS = [
  'INSSSEP', 'Swiss Medical', 'OSDE', 'Galeno', 'CONSULTA PARTICULAR', 'Otras Obras Sociales'
];

const ClinicConfigContext = createContext<ClinicConfigContextType>({
  socialWorks: DEFAULT_SOCIAL_WORKS,
  settings: null,
  clinicName: ''
});

export const ClinicConfigProvider = ({ children }: { children: ReactNode }) => {
  const [socialWorks, setSocialWorks] = useState<string[]>(DEFAULT_SOCIAL_WORKS);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [clinicName, setClinicName] = useState('');

  useEffect(() => {
    axiosInstance.get('/clinic/config')
      .then(res => {
        if (res.data.success && res.data.data) {
          const data = res.data.data;
          if (data.socialWorks?.length) setSocialWorks(data.socialWorks);
          if (data.settings) setSettings(data.settings);
          if (data.name) setClinicName(data.name);
        }
      })
      .catch(() => {
        // Keep defaults on error
      });
  }, []);

  return (
    <ClinicConfigContext.Provider value={{ socialWorks, settings, clinicName }}>
      {children}
    </ClinicConfigContext.Provider>
  );
};

export const useClinicConfig = () => useContext(ClinicConfigContext);
