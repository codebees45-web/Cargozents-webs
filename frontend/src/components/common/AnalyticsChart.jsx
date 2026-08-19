import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#5B7A70',
        font: {
          family: "'JetBrains Mono', monospace",
          size: 11
        }
      }
    },
    tooltip: {
      backgroundColor: '#0a100d',
      titleColor: '#E2E8F0',
      bodyColor: '#94A3B8',
      borderColor: 'rgba(230, 255, 250, 0.1)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      displayColors: true,
      titleFont: {
        family: "'Outfit', sans-serif",
        size: 13
      },
      bodyFont: {
        family: "'Outfit', sans-serif",
        size: 12
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        color: '#5B7A70',
        font: {
          family: "'JetBrains Mono', monospace",
          size: 10
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(230, 255, 250, 0.05)',
        drawBorder: false,
      },
      ticks: {
        color: '#5B7A70',
        font: {
          family: "'JetBrains Mono', monospace",
          size: 10
        }
      }
    },
    y1: {
      display: 'auto',
      position: 'right',
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        color: '#5B7A70',
        font: {
          family: "'JetBrains Mono', monospace",
          size: 10
        }
      }
    }
  }
};

const doughnutOptions = {
  ...commonOptions,
  scales: {
    x: { display: false },
    y: { display: false }
  },
  cutout: '70%',
};

export const AnalyticsChart = ({ type = 'bar', data, title, subtitle, height = 300 }) => {
  if (!data || !data.datasets || data.datasets.length === 0) {
    return null;
  }

  const renderChart = () => {
    switch (type.toLowerCase()) {
      case 'line':
        return <Line data={data} options={commonOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={doughnutOptions} />;
      case 'bar':
      default:
        return <Bar data={data} options={commonOptions} />;
    }
  };

  return (
    <div className="rounded-xl border border-primary/10 bg-secondary/10 p-6 shadow-sm">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="font-display text-lg font-semibold text-primary">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-xs text-[#5B7A70]">{subtitle}</p>}
        </div>
      )}
      <div style={{ height: `${height}px`, width: '100%' }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default AnalyticsChart;
