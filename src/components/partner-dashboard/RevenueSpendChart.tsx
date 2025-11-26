import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface RevenueSpendChartProps {
  currency?: string;
}

export default function RevenueSpendChart({ currency = 'USD' }: RevenueSpendChartProps) {
  // Mock data - TODO: Replace with actual API data
  const revenueData = [12500, 15200, 18400, 16800, 21500, 24300, 28700, 31200, 29800, 35400, 38900, 42100];
  const spendData = [8200, 9100, 10500, 9800, 11200, 12800, 14500, 15800, 14200, 16700, 18200, 19500];

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit, sans-serif",
      fontSize: "14px",
      fontWeight: 500,
      markers: {
        size: 6,
        shape: "circle",
      },
    },
    colors: ["#10B981", "#EF4444"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 350,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    markers: {
      size: 0,
      hover: {
        size: 5,
      },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10,
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value);
        },
      },
    },
    xaxis: {
      type: "category",
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "12px",
          fontFamily: "Outfit, sans-serif",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "12px",
          fontFamily: "Outfit, sans-serif",
        },
        formatter: (value: number) => {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            notation: 'compact',
          }).format(value);
        },
      },
    },
  };

  const series = [
    {
      name: "Revenue",
      data: revenueData,
    },
    {
      name: "Spend",
      data: spendData,
    },
  ];

  return (
    <div className="w-full p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
      <Chart options={options} series={series} type="area" height={350} />
    </div>
  );
}
