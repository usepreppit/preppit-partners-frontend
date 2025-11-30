import { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface PracticeTypeData {
  type: string;
  count: number;
  percentage: number;
}

interface PracticeTypeDistributionProps {
  data: PracticeTypeData[];
}

export default function PracticeTypeDistribution({ data }: PracticeTypeDistributionProps) {
  const { series, labels } = useMemo(() => {
    return {
      labels: data.map((item) => item.type),
      series: data.map((item) => item.count),
    };
  }, [data]);

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      height: 300,
    },
    labels: labels,
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
    legend: {
      position: 'right',
      fontSize: '12px',
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toFixed(1) + '%';
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '14px',
              fontWeight: 600,
            },
          },
        },
      },
    },
  };

  return (
    <div className="h-[300px]">
      <ReactApexChart options={options} series={series} type="donut" height={300} />
    </div>
  );
}
