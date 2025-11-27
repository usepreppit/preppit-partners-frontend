import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { CandidatesGrowthData, transformChartData, getChartLabels } from "../../services/dashboard.service";

interface CandidatesGrowthChartProps {
  chartData?: CandidatesGrowthData;
}

export default function CandidatesGrowthChart({ chartData }: CandidatesGrowthChartProps) {
  // Use provided data or fallback to mock data for development
  const candidatesData = chartData ? transformChartData(chartData.candidates) : [12, 18, 25, 32, 45, 58, 72, 89, 105, 128, 142, 156];
  const categories = chartData ? getChartLabels(chartData.candidates) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const options: ApexOptions = {
    legend: {
      show: false,
    },
    colors: ["#3B82F6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 350,
      type: "bar",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#6B7280"],
        fontFamily: "Outfit, sans-serif",
        fontWeight: 500,
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
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
    tooltip: {
      y: {
        formatter: (value: number) => {
          return `${value} candidates`;
        },
      },
    },
    xaxis: {
      categories: categories,
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
          return Math.round(value).toString();
        },
      },
    },
    fill: {
      opacity: 1,
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.3,
        opacityFrom: 0.9,
        opacityTo: 0.7,
      },
    },
  };

  const series = [
    {
      name: "Candidates",
      data: candidatesData,
    },
  ];

  return (
    <div className="w-full p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
}
