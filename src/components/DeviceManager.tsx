
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Plus, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Wrench,
  Zap,
  Building2,
  MapPin
} from "lucide-react";

interface DeviceManagerProps {
  data: any;
}

const DeviceManager = ({ data }: DeviceManagerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState("all");

  const getDisciplineIcon = (disciplineId: string) => {
    switch (disciplineId) {
      case "mech":
        return <Wrench className="h-4 w-4" />;
      case "elect":
        return <Zap className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "calibrated":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Calibrated</Badge>;
      case "due_soon":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100"><AlertTriangle className="h-3 w-3 mr-1" />Due Soon</Badge>;
      case "overdue":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredDevices = data.devices.filter((device: any) => {
    const deviceType = data.deviceTypes.find((dt: any) => dt.id === device.device_type_id);
    const customer = data.customers.find((c: any) => c.id === device.customer_id);
    
    const matchesSearch = 
      device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serial_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deviceType?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDiscipline = selectedDiscipline === "all" || deviceType?.discipline_id === selectedDiscipline;
    const matchesStatus = selectedStatus === "all" || device.status === selectedStatus;
    const matchesCustomer = selectedCustomer === "all" || device.customer_id === selectedCustomer;
    
    return matchesSearch && matchesDiscipline && matchesStatus && matchesCustomer;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Device Management</h2>
          <p className="text-slate-600">Manage your calibration devices and equipment</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Device
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {data.customers.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Discipline</label>
              <Select value={selectedDiscipline} onValueChange={setSelectedDiscipline}>
                <SelectTrigger>
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Disciplines</SelectItem>
                  {data.disciplines.map((discipline: any) => (
                    <SelectItem key={discipline.id} value={discipline.id}>
                      {discipline.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="calibrated">Calibrated</SelectItem>
                  <SelectItem value="due_soon">Due Soon</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDevices.map((device: any) => {
          const deviceType = data.deviceTypes.find((dt: any) => dt.id === device.device_type_id);
          const discipline = data.disciplines.find((d: any) => d.id === deviceType?.discipline_id);
          const customer = data.customers.find((c: any) => c.id === device.customer_id);
          
          return (
            <Card key={device.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{device.model}</CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getDisciplineIcon(discipline?.id)}
                        <span>{deviceType?.name}</span>
                        <span>•</span>
                        <span>S/N: {device.serial_no}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <Building2 className="h-3 w-3" />
                        <span>{customer?.name}</span>
                        <span>•</span>
                        <MapPin className="h-3 w-3" />
                        <span>{device.location}</span>
                      </div>
                    </CardDescription>
                  </div>
                  {getStatusBadge(device.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Range</p>
                      <p className="font-medium">{device.range}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Least Count</p>
                      <p className="font-medium">{device.least_count}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {device.next_due_date}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm">
                        Calibrate
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDevices.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Settings className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No devices found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeviceManager;
