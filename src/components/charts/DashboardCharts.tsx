import { useEffect, useRef } from 'react';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
);

const baseBarOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#8090B8', font: { size: 10 } } },
    y: {
      grid: { color: 'rgba(0,0,80,.05)' },
      ticks: { color: '#8090B8', font: { size: 10 } },
    },
  },
};

function useChart(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  config: ConstructorParameters<typeof Chart>[1] | null,
) {
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el || !config) return;
    const wrap = el.closest('.chart-wrap');
    if (!wrap || (wrap as HTMLElement).offsetWidth === 0) return;

    chartRef.current?.destroy();
    chartRef.current = new Chart(el, config as never);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [canvasRef, config]);
}

export function RevenueChart() {
  const ref = useRef<HTMLCanvasElement>(null);
  useChart(ref, {
    type: 'bar',
    data: {
      labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [
        {
          data: [2.1, 2.8, 3.1, 2.9, 3.8, 4.2],
          backgroundColor: [
            'rgba(0,0,104,.1)',
            'rgba(0,0,104,.1)',
            'rgba(0,0,104,.1)',
            'rgba(0,0,104,.1)',
            'rgba(0,0,104,.14)',
            '#000068',
          ],
          borderRadius: 5,
          borderSkipped: false,
          borderWidth: 0,
        },
      ],
    },
    options: {
      ...baseBarOpts,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => `₦${c.parsed.y}M` } },
      },
      scales: {
        ...baseBarOpts.scales,
        y: {
          ...baseBarOpts.scales.y,
          ticks: {
            ...baseBarOpts.scales.y.ticks,
            callback: (v) => `₦${v}M`,
          },
        },
      },
    },
  });
  return <canvas ref={ref} />;
}

export function AgingChart() {
  const ref = useRef<HTMLCanvasElement>(null);
  useChart(ref, {
    type: 'doughnut',
    data: {
      labels: ['Current', 'Due Soon', 'Overdue'],
      datasets: [
        {
          data: [8, 4, 5],
          backgroundColor: ['#00B341', '#F59E0B', '#EF4444'],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 10 }, color: '#1E2060', padding: 8, boxWidth: 10 },
        },
      },
    },
  });
  return <canvas ref={ref} />;
}

export function PipelineChart() {
  const ref = useRef<HTMLCanvasElement>(null);
  useChart(ref, {
    type: 'bar',
    data: {
      labels: ['New', 'Contact', 'Qualify', 'Negot.', 'LPO', 'Customer'],
      datasets: [
        {
          data: [4, 7, 5, 3, 6, 55],
          backgroundColor: ['#000068', '#3B82F6', '#8B5CF6', '#F59E0B', '#00B341', '#00D44D'],
          borderRadius: 5,
          borderSkipped: false,
          borderWidth: 0,
        },
      ],
    },
    options: {
      ...baseBarOpts,
      scales: {
        x: { grid: { display: false }, ticks: { color: '#8090B8', font: { size: 9 } } },
        y: { display: false },
      },
    },
  });
  return <canvas ref={ref} />;
}

export function ReportRevenueChart() {
  const ref = useRef<HTMLCanvasElement>(null);
  useChart(ref, {
    type: 'bar',
    data: {
      labels: ['Samuel (Rep)', 'Abubakar (Admin)', 'Emmanuel (Rep)'],
      datasets: [
        {
          data: [820000, 540000, 380000],
          backgroundColor: ['#000068', '#3B82F6', '#8B5CF6'],
          borderRadius: 6,
          borderSkipped: false,
          borderWidth: 0,
        },
      ],
    },
    options: {
      ...baseBarOpts,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: (c) => `₦${(c.parsed.y ?? 0).toLocaleString()}` },
        },
      },
      scales: {
        ...baseBarOpts.scales,
        y: {
          ...baseBarOpts.scales.y,
          ticks: {
            ...baseBarOpts.scales.y.ticks,
            callback: (v) => `₦${Number(v) / 1000}K`,
          },
        },
      },
    },
  });
  return <canvas ref={ref} />;
}
