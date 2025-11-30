import { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface SessionTrendline {
  date: string;
  sessions: number;
  unique_candidates: number;
}

interface SessionTrendChartProps {
  data: SessionTrendline[];
  period: 'daily' | 'weekly' | 'monthly';
}

export default function SessionTrendChart({ data, period }: SessionTrendChartProps) {
  const { series, categories } = useMemo(() => {
    const categories = data.map((item) => {
      if (period === 'daily') {
        return new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (period === 'weekly') {
        return item.date;
      } else {
        return new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
    });

    return {
      categories,
      series: [
        {
          name: 'Sessions',
          data: data.map((item) => item.sessions),
        },
        {
          name: 'Unique Candidates',
          data: data.map((item) => item.unique_candidates),
        },
      ],
    };
  }, [data, period]);

  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 300,
      toolbar: {
        show: false,
      },
    },
    colors: ['#3b82f6', '#10b981'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: ['#93c5fd', '#6ee7b7'],
        opacityFrom: 0.7,
        opacityTo: 0.3,
      },
    },
  };

  return (
    <div className="h-[300px]">
      <ReactApexChart options={options} series={series} type="line" height={300} />
    </div>
  );
}
