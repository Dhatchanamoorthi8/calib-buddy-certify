
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  TrendingUp
} from "lucide-react";

interface DashboardStatsProps {
  data: any;
}

const DashboardStats = ({ data }: DashboardStatsProps) => {
  const totalDevices = data.devices.length;
  const calibratedDevices = data.devices.filter((d: any) => d.status === "calibrated").length;
  const dueSoonDevices = data.devices.filter((d: any) => d.status === "due_soon").length;
  const overdueDevices = data.devices.filter((d: any) => d.status === "overdue").length;

  const stats = [
    {
      title: "Total Devices",
      value: totalDevices,
      icon: Settings,
      color: "blue",
      description: "Active in system"
    },
    {
      title: "Calibrated",
      value: calibratedDevices,
      icon: CheckCircle,
      color: "green",
      description: "Up to date"
    },
    {
      title: "Due Soon",
      value: dueSoonDevices,
      icon: Calendar,
      color: "amber",
      description: "Within 30 days"
    },
    {
      title: "Overdue",
      value: overdueDevices,
      icon: AlertTriangle,
      color: "red",
      description: "Requires attention"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "green":
        return "bg-green-50 text-green-700 border-green-200";
      case "amber":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "red":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.title} className={`border-2 ${getColorClasses(stat.color)} hover:shadow-md transition-shadow`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <IconComponent className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs opacity-80">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;
