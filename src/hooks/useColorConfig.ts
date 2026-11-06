import { useCMS } from '../context/CMSContext';

interface BadgeColorConfig {
  id: string;
  iconColor: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  hoverIconColor?: string;
  hoverBackgroundColor?: string;
  hoverBorderColor?: string;
  hoverShadow?: string;
}

interface MetricColorConfig {
  id: string;
  iconColor: string;
  backgroundColor: string;
  textColor: string;
  labelColor: string;
}

interface ColorConfigResult {
  global: any;
  section: any;
  getBadgeColors: (badgeId: string) => BadgeColorConfig | null;
  getMetricColors: (metricId: string) => MetricColorConfig | null;
  cards: any;
  buttons: any;
  badges: any;
}

export const useColorConfig = (section?: string): ColorConfigResult => {
  const { settings } = useCMS();
  const globalColorConfig = (settings as any).colorConfig;
  const sectionColorConfig = section ? globalColorConfig?.[section] : null;
  
  const getBadgeColors = (badgeId: string): BadgeColorConfig | null => {
    const globalBadge = globalColorConfig?.hero?.badges?.find((b: any) => b.id === badgeId);
    return globalBadge || null;
  };
  
  const getMetricColors = (metricId: string): MetricColorConfig | null => {
    const globalMetric = globalColorConfig?.hero?.metrics?.find((m: any) => m.id === metricId);
    return globalMetric || null;
  };
  
  return {
    global: globalColorConfig,
    section: sectionColorConfig,
    getBadgeColors,
    getMetricColors,
    cards: globalColorConfig?.cards,
    buttons: globalColorConfig?.buttons,
    badges: globalColorConfig?.badges,
  };
};

export default useColorConfig;
