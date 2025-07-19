import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FlaskConical, 
  Wrench, 
  Zap, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Settings,
  FileText,
  BarChart3
} from "lucide-react";
import DeviceManager from "@/components/DeviceManager";
import CalibrationWorkflow from "@/components/CalibrationWorkflow";
import DashboardStats from "@/components/DashboardStats";

// Expanded sample data with customers and diverse device types
const sampleData = {
  customers: [
    {
      id: "cust-001",
      name: "Tata Motors",
      plant: "Pune Plant 3",
      address: "MIDC Industrial Area, Pune, Maharashtra 411026"
    },
    {
      id: "cust-002", 
      name: "Mahindra & Mahindra",
      plant: "Kandivali Plant",
      address: "Kandivali Industrial Estate, Mumbai, Maharashtra 400067"
    }
  ],
  disciplines: [
    { id: "mech", name: "Mechanical" },
    { id: "elect", name: "Electrical" }
  ],
  deviceTypes: [
    { id: "dtype-ring", discipline_id: "mech", name: "Thread Ring Gauge" },
    { id: "dtype-vernier", discipline_id: "mech", name: "Vernier Caliper" },
    { id: "dtype-micrometer", discipline_id: "mech", name: "Micrometer" },
    { id: "dtype-dmm", discipline_id: "elect", name: "Digital Multimeter" },
    { id: "dtype-oscilloscope", discipline_id: "elect", name: "Oscilloscope" }
  ],
  devices: [
    {
      id: "dev-101",
      device_type_id: "dtype-ring",
      customer_id: "cust-001",
      model: "M10x1.5",
      serial_no: "RG-789",
      range: "M10",
      unit: "Thread",
      least_count: "-",
      location: "Inward Inspection",
      next_due_date: "2026-07-01",
      status: "due_soon"
    },
    {
      id: "dev-102",
      device_type_id: "dtype-vernier",
      customer_id: "cust-001",
      model: "Mitutoyo 530-122",
      serial_no: "VC1234",
      range: "0–150mm",
      least_count: "0.01mm",
      unit: "mm",
      location: "Quality Lab",
      next_due_date: "2025-12-31",
      status: "calibrated"
    },
    {
      id: "dev-103",
      device_type_id: "dtype-dmm",
      customer_id: "cust-002",
      model: "Fluke 87V",
      serial_no: "DMM5678",
      range: "0-1000V DC",
      least_count: "0.1mV",
      unit: "V",
      location: "Electronics Lab",
      next_due_date: "2025-08-15",
      status: "calibrated"
    }
  ],
  deviceParameters: [
    {
      device_type_id: "dtype-ring",
      step_no: 1,
      description: "Go Member Check",
      expected_result: "Go",
      tolerance_type: "go-nogo"
    },
    {
      device_type_id: "dtype-ring", 
      step_no: 2,
      description: "No-Go Member Check",
      expected_result: "No-Go",
      tolerance_type: "go-nogo"
    },
    {
      device_type_id: "dtype-vernier",
      step_no: 1,
      std_input_value: 0.00,
      tolerance_plus: 0.02,
      tolerance_minus: -0.02,
      unit: "mm",
      description: "Zero Point Check",
      tolerance_type: "range"
    },
    {
      device_type_id: "dtype-vernier",
      step_no: 2,
      std_input_value: 50.00,
      tolerance_plus: 0.03,
      tolerance_minus: -0.03,
      unit: "mm",
      description: "Mid-Point Check",
      tolerance_type: "range"
    },
    {
      device_type_id: "dtype-vernier",
      step_no: 3,
      std_input_value: 100.00,
      tolerance_plus: 0.03,
      tolerance_minus: -0.03,
      unit: "mm",
      description: "Full Scale Check",
      tolerance_type: "range"
    },
    {
      device_type_id: "dtype-dmm",
      step_no: 1,
      std_input_value: 10.000,
      tolerance_plus: 0.001,
      tolerance_minus: -0.001,
      unit: "V",
      description: "10V DC Check",
      tolerance_type: "range"
    }
  ]
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [appData, setAppData] = useState(sampleData);

  const handleDataUpdate = (updatedData: any) => {
    setAppData(updatedData);
  };

  const getDisciplineIcon = (disciplineId: string) => {
    switch (disciplineId) {
      case "mech":
        return <Wrench className="h-5 w-5" />;
      case "elect":
        return <Zap className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "calibrated":
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Calibrated</Badge>;
      case "due_soon":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100"><AlertTriangle className="h-3 w-3 mr-1" />Due Soon</Badge>;
      case "overdue":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-lg">
                <FlaskConical className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">CalibBuddy 🧪💡</h1>
                <p className="text-sm text-slate-600">Intelligent Calibration Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Device
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Devices</span>
            </TabsTrigger>
            <TabsTrigger value="calibrate" className="flex items-center space-x-2">
              <FlaskConical className="h-4 w-4" />
              <span>Calibrate</span>
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Certificates</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardStats data={appData} />
            
            {/* Customer Overview */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Customer Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appData.customers.map((customer) => {
                  const customerDevices = appData.devices.filter(
                    d => d.customer_id === customer.id
                  );
                  
                  return (
                    <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{customer.name}</CardTitle>
                        <CardDescription>{customer.plant} • {customer.address}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">
                            {customerDevices.length} devices registered
                          </span>
                          <Badge variant="outline">{customerDevices.length}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Disciplines Overview */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Disciplines</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appData.disciplines.map((discipline) => {
                  const disciplineDeviceTypes = appData.deviceTypes.filter(
                    dt => dt.discipline_id === discipline.id
                  );
                  const disciplineDevices = appData.devices.filter(
                    d => disciplineDeviceTypes.some(dt => dt.id === d.device_type_id)
                  );
                  
                  return (
                    <Card key={discipline.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center space-x-2 text-lg">
                          {getDisciplineIcon(discipline.id)}
                          <span>{discipline.name}</span>
                        </CardTitle>
                        <CardDescription>
                          {disciplineDeviceTypes.length} device types, {disciplineDevices.length} devices
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {disciplineDeviceTypes.map((deviceType) => (
                            <div key={deviceType.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                              <span className="text-sm font-medium">{deviceType.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {appData.devices.filter(d => d.device_type_id === deviceType.id).length} devices
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Upcoming Calibrations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appData.devices.map((device) => {
                    const deviceType = appData.deviceTypes.find(dt => dt.id === device.device_type_id);
                    const customer = appData.customers.find(c => c.id === device.customer_id);
                    return (
                      <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="font-medium">{device.model}</p>
                          <p className="text-sm text-slate-600">
                            {deviceType?.name} • {customer?.name} • S/N: {device.serial_no}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-sm font-medium">Due: {device.next_due_date}</p>
                            {getStatusBadge(device.status)}
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setSelectedDevice(device);
                              setActiveTab("calibrate");
                            }}
                          >
                            Calibrate
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices">
            <DeviceManager data={appData} onDataUpdate={handleDataUpdate} />
          </TabsContent>

          <TabsContent value="calibrate">
            <CalibrationWorkflow 
              data={appData} 
              selectedDevice={selectedDevice}
              onDeviceSelect={setSelectedDevice}
            />
          </TabsContent>

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Calibration Certificates</CardTitle>
                <CardDescription>
                  View and download calibration certificates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Certificate management coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
