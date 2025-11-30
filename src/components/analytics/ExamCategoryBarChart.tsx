import { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface ExamCategoryData {
  category: string;
  sessions: number;
  avg_score: number;
}

interface ExamCategoryBarChartProps {
  data: ExamCategoryData[];
}

export default function ExamCategoryBarChart({ data }: ExamCategoryBarChartProps) {
  const { series, categories } = useMemo(() => {
    return {
      categories: data.map((item) => item.category),
      series: [
        {
          name: 'Sessions',
          data: data.map((item) => item.sessions),
        },
      ],
    };
  }, [data]);

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        horizontal: false,
        columnWidth: '60%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ['#3b82f6'],
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
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
    },
  };

  return (
    <div className="h-[300px]">
      <ReactApexChart options={options} series={series} type="bar" height={300} />
    </div>
  );
}
