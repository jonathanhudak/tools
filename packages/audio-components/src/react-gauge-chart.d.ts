declare module 'react-gauge-chart' {
  import React from 'react';

  interface GaugeChartProps {
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    nrOfLevels?: number;
    percent?: number;
    arcWidth?: number;
    colors?: string[];
    textColor?: string;
    needleColor?: string;
    needleBaseColor?: string;
    hideText?: boolean;
    animate?: boolean;
    animDelay?: number;
    animateDuration?: number;
  }

  const GaugeChart: React.FC<GaugeChartProps>;
  export default GaugeChart;
}
