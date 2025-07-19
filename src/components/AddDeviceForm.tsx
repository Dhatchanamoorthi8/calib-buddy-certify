
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  X, 
  Wrench, 
  Zap, 
  Settings,
  Calendar,
  MapPin,
  Hash,
  Ruler
} from "lucide-react";

interface AddDeviceFormProps {
  data: any;
  onClose: () => void;
  onDeviceAdded: (device: any) => void;
}

const AddDeviceForm = ({ data, onClose, onDeviceAdded }: AddDeviceFormProps) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState("");
  const [selectedDeviceType, setSelectedDeviceType] = useState("");
  const [deviceDetails, setDeviceDetails] = useState({
    model: "",
    serial_no: "",
    range: "",
    unit: "",
    least_count: "",
    location: "",
    next_due_date: "",
    customer_id: ""
  });
  
  const { toast } = useToast();

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

  const filteredDeviceTypes = data.deviceTypes.filter(
    (dt: any) => dt.discipline_id === selectedDiscipline
  );

  const selectedDeviceTypeData = data.deviceTypes.find(
    (dt: any) => dt.id === selectedDeviceType
  );

  const deviceParameters = data.deviceParameters.filter(
    (p: any) => p.device_type_id === selectedDeviceType
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDiscipline || !selectedDeviceType || !deviceDetails.model || !deviceDetails.serial_no) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Generate new device ID
    const newDeviceId = `dev-${Date.now()}`;
    
    const newDevice = {
      id: newDeviceId,
      device_type_id: selectedDeviceType,
      ...deviceDetails,
      status: "calibrated" // Default status for new devices
    };

    console.log('Adding new device:', newDevice);
    
    onDeviceAdded(newDevice);
    
    toast({
      title: "Device Added Successfully! ✅",
      description: `${deviceDetails.model} has been added to the system.`,
    });

    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setDeviceDetails(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add New Device</span>
              </CardTitle>
              <CardDescription>
                Select discipline, device type, and enter device details
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Select Discipline */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Step 1: Select Discipline</Label>
                <p className="text-sm text-slate-600">Choose the discipline for this device</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.disciplines.map((discipline: any) => (
                  <Card 
                    key={discipline.id}
                    className={`cursor-pointer transition-all ${
                      selectedDiscipline === discipline.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => {
                      setSelectedDiscipline(discipline.id);
                      setSelectedDeviceType(""); // Reset device type selection
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        {getDisciplineIcon(discipline.id)}
                        <span className="font-medium">{discipline.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Step 2: Select Device Type */}
            {selectedDiscipline && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Step 2: Select Device Type</Label>
                  <p className="text-sm text-slate-600">Choose the specific device type</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredDeviceTypes.map((deviceType: any) => (
                    <Card 
                      key={deviceType.id}
                      className={`cursor-pointer transition-all ${
                        selectedDeviceType === deviceType.id 
                          ? 'ring-2 ring-green-500 bg-green-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedDeviceType(deviceType.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          {getDisciplineIcon(selectedDiscipline)}
                          <span className="font-medium text-sm">{deviceType.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Device Information */}
            {selectedDeviceType && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Step 3: Device Information</Label>
                  <p className="text-sm text-slate-600">Enter the device details</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer *</Label>
                    <Select 
                      value={deviceDetails.customer_id} 
                      onValueChange={(value) => handleInputChange('customer_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.customers.map((customer: any) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Device Model *</Label>
                    <Input
                      id="model"
                      placeholder="e.g., Mitutoyo 530-122"
                      value={deviceDetails.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serial_no">Serial Number *</Label>
                    <div className="relative">
                      <Hash className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                      <Input
                        id="serial_no"
                        placeholder="e.g., VC1234"
                        value={deviceDetails.serial_no}
                        onChange={(e) => handleInputChange('serial_no', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="range">Range/Capacity</Label>
                    <div className="relative">
                      <Ruler className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                      <Input
                        id="range"
                        placeholder="e.g., 0-150mm"
                        value={deviceDetails.range}
                        onChange={(e) => handleInputChange('range', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit of Measurement</Label>
                    <Input
                      id="unit"
                      placeholder="e.g., mm, V, A"
                      value={deviceDetails.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="least_count">Least Count/Precision</Label>
                    <Input
                      id="least_count"
                      placeholder="e.g., 0.01mm"
                      value={deviceDetails.least_count}
                      onChange={(e) => handleInputChange('least_count', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                      <Input
                        id="location"
                        placeholder="e.g., Quality Lab"
                        value={deviceDetails.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="next_due_date">Next Due Date</Label>
                    <div className="relative">
                      <Calendar className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                      <Input
                        id="next_due_date"
                        type="date"
                        value={deviceDetails.next_due_date}
                        onChange={(e) => handleInputChange('next_due_date', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Device Parameters Preview */}
            {selectedDeviceType && deviceParameters.length > 0 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Step 4: Calibration Parameters Preview</Label>
                  <p className="text-sm text-slate-600">
                    These parameters will be used during calibration of this device type
                  </p>
                </div>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {deviceParameters.map((param: any, index: number) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg bg-slate-50">
                          <div>
                            <p className="text-sm text-slate-600">Step {param.step_no}</p>
                            <p className="font-medium text-sm">{param.description}</p>
                          </div>
                          
                          {param.tolerance_type === "go-nogo" ? (
                            <div>
                              <p className="text-sm text-slate-600">Expected Result</p>
                              <p className="font-medium text-sm">{param.expected_result}</p>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="text-sm text-slate-600">Standard Value</p>
                                <p className="font-medium text-sm">{param.std_input_value} {param.unit}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-600">Tolerance</p>
                                <p className="font-medium text-sm">
                                  {param.tolerance_minus} to +{param.tolerance_plus} {param.unit}
                                </p>
                              </div>
                            </>
                          )}
                          
                          <div>
                            <p className="text-sm text-slate-600">Type</p>
                            <p className="font-medium text-sm capitalize">
                              {param.tolerance_type.replace('-', '/')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedDeviceType || !deviceDetails.model || !deviceDetails.serial_no}>
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddDeviceForm;
