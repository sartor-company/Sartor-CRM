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

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function RevenueChart({ monthlyRevenue }: { monthlyRevenue?: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const now = new Date().getMonth();
  const values =
    monthlyRevenue && monthlyRevenue.length
      ? monthlyRevenue.map((v) => (Number(v) || 0) / 1_000_000)
      : [0, 0, 0, 0, 0, 0];
  const labels = monthlyRevenue?.length
    ? values.map((_, i) => MONTH_LABELS[(now - values.length + 1 + i + 12) % 12])
    : MONTH_LABELS.slice(Math.max(0, now - 5), now + 1);

  useChart(ref, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: values.map((_, i) =>
            i === values.length - 1 ? '#000068' : i === values.length - 2 ? 'rgba(0,0,104,.14)' : 'rgba(0,0,104,.1)',
          ),
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

export function AgingChart({ counts }: { counts?: [number, number, number] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const data = counts ?? [0, 0, 0];
  useChart(ref, {
    type: 'doughnut',
    data: {
      labels: ['Current', 'Due Soon', 'Overdue'],
      datasets: [
        {
          data,
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

export function PipelineChart({ counts }: { counts?: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const data = counts ?? [0, 0, 0, 0, 0, 0];
  useChart(ref, {
    type: 'bar',
    data: {
      labels: ['Contact', 'Qualify', 'Interest', 'Negot.', 'LPO', 'Won'],
      datasets: [
        {
          data,
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

export function ReportRevenueChart({
  labels = [],
  values = [],
}: {
  labels?: string[];
  values?: number[];
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartLabels = labels.length ? labels : ['—'];
  const chartValues = values.length ? values : [0];
  useChart(ref, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [
        {
          data: chartValues,
          backgroundColor: chartValues.map((_, i) =>
            i === 0 ? '#000068' : i === 1 ? '#3B82F6' : '#8B5CF6',
          ),
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
