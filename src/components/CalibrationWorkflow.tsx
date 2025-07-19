
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  FlaskConical, 
  CheckCircle, 
  XCircle, 
  Settings,
  ArrowRight,
  Download,
  AlertTriangle,
  Target,
  Building2,
  MapPin
} from "lucide-react";

interface CalibrationWorkflowProps {
  data: any;
  selectedDevice: any;
  onDeviceSelect: (device: any) => void;
}

const CalibrationWorkflow = ({ data, selectedDevice, onDeviceSelect }: CalibrationWorkflowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [observations, setObservations] = useState<{ [key: number]: any }>({});
  const [results, setResults] = useState<{ [key: number]: { pass: boolean; error?: number } }>({});
  const [calibrationComplete, setCalibrationComplete] = useState(false);
  const { toast } = useToast();

  const deviceParameters = selectedDevice 
    ? data.deviceParameters.filter((p: any) => p.device_type_id === selectedDevice.device_type_id)
    : [];

  useEffect(() => {
    // Reset state when device changes
    setCurrentStep(0);
    setObservations({});
    setResults({});
    setCalibrationComplete(false);
  }, [selectedDevice]);

  useEffect(() => {
    // Auto-calculate results when observations change
    const currentParam = deviceParameters[currentStep];
    if (currentParam && observations[currentStep] !== undefined) {
      let pass = false;
      let error = undefined;

      if (currentParam.tolerance_type === "go-nogo") {
        // Go/No-Go logic
        pass = observations[currentStep] === currentParam.expected_result;
      } else if (currentParam.tolerance_type === "range") {
        // Range-based logic
        const observedValue = parseFloat(observations[currentStep]);
        if (!isNaN(observedValue)) {
          error = observedValue - currentParam.std_input_value;
          pass = error >= currentParam.tolerance_minus && error <= currentParam.tolerance_plus;
        }
      }
      
      setResults(prev => ({
        ...prev,
        [currentStep]: { pass, error }
      }));
    }
  }, [observations, currentStep, deviceParameters]);

  const handleObservationChange = (stepNo: number, value: any) => {
    setObservations(prev => ({ ...prev, [stepNo]: value }));
  };

  const nextStep = () => {
    if (currentStep < deviceParameters.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeCalibration();
    }
  };

  const completeCalibration = () => {
    setCalibrationComplete(true);
    const allPassed = Object.values(results).every(r => r.pass);
    
    toast({
      title: allPassed ? "Calibration Passed! ✅" : "Calibration Failed ❌",
      description: allPassed 
        ? "All measurements are within tolerance limits." 
        : "Some measurements are outside tolerance limits.",
    });
  };

  const generateCertificate = () => {
    const deviceType = data.deviceTypes.find((dt: any) => dt.id === selectedDevice.device_type_id);
    const customer = data.customers.find((c: any) => c.id === selectedDevice.customer_id);
    const allPassed = Object.values(results).every(r => r.pass);
    
    // Generate certificate number
    const certNumber = `CAL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    console.log('Generating certificate with data:', {
      certNumber,
      customer,
      device: selectedDevice,
      deviceType,
      observations,
      results,
      calibrationDate: new Date().toISOString().split('T')[0],
      nextDueDate: selectedDevice.next_due_date,
      status: allPassed ? 'PASSED' : 'FAILED'
    });
    
    toast({
      title: "Certificate Generated! 📄",
      description: `Certificate ${certNumber} for ${selectedDevice.model} has been created and is ready for download.`,
    });
  };

  if (!selectedDevice) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Calibration Workflow</h2>
          <p className="text-slate-600">Select a device to begin calibration</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Select Device</CardTitle>
            <CardDescription>Choose a device to start the calibration process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.devices.map((device: any) => {
                const deviceType = data.deviceTypes.find((dt: any) => dt.id === device.device_type_id);
                const customer = data.customers.find((c: any) => c.id === device.customer_id);
                return (
                  <Card 
                    key={device.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                    onClick={() => onDeviceSelect(device)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{device.model}</CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span>{deviceType?.name}</span>
                          <span>•</span>
                          <span>S/N: {device.serial_no}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <Building2 className="h-3 w-3" />
                          <span>{customer?.name}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Range: {device.range}</span>
                        <ArrowRight className="h-4 w-4 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const deviceType = data.deviceTypes.find((dt: any) => dt.id === selectedDevice.device_type_id);
  const customer = data.customers.find((c: any) => c.id === selectedDevice.customer_id);
  const currentParam = deviceParameters[currentStep];
  const progress = ((currentStep + (calibrationComplete ? 1 : 0)) / deviceParameters.length) * 100;
  const allPassed = Object.values(results).every(r => r.pass);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Calibrating: {selectedDevice.model}</h2>
          <div className="space-y-1">
            <p className="text-slate-600">{deviceType?.name} • S/N: {selectedDevice.serial_no}</p>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <Building2 className="h-3 w-3" />
                <span>{customer?.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{selectedDevice.location}</span>
              </div>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => onDeviceSelect(null)}>
          <Settings className="h-4 w-4 mr-2" />
          Change Device
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-slate-600">
              <span>Step {calibrationComplete ? deviceParameters.length : currentStep + 1} of {deviceParameters.length}</span>
              <span>{calibrationComplete ? "Complete" : "In Progress"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {!calibrationComplete ? (
        /* Current Step */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Step {currentStep + 1}: {currentParam?.description}</span>
            </CardTitle>
            <CardDescription>
              {currentParam?.tolerance_type === "go-nogo" 
                ? "Select the observed result for this Go/No-Go check"
                : "Enter the observed reading for this calibration point"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentParam?.tolerance_type === "go-nogo" ? (
              /* Go/No-Go Interface */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Expected Result</label>
                  <div className="p-3 bg-blue-50 rounded-lg border">
                    <span className="text-lg font-bold text-blue-800">
                      {currentParam.expected_result}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Observed Result *</label>
                  <Select
                    value={observations[currentStep] || ""}
                    onValueChange={(value) => handleObservationChange(currentStep, value)}
                  >
                    <SelectTrigger className="text-lg">
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Go">Go</SelectItem>
                      <SelectItem value="No-Go">No-Go</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              /* Range-based Interface */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Standard Input Value</label>
                  <div className="p-3 bg-blue-50 rounded-lg border">
                    <span className="text-lg font-bold text-blue-800">
                      {currentParam?.std_input_value} {currentParam?.unit}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Observed Reading *</label>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder={`Enter reading in ${currentParam?.unit}`}
                    value={observations[currentStep] || ""}
                    onChange={(e) => handleObservationChange(currentStep, e.target.value)}
                    className="text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tolerance Range</label>
                  <div className="p-3 bg-slate-50 rounded-lg border">
                    <span className="text-sm">
                      {(currentParam?.std_input_value + currentParam?.tolerance_minus).toFixed(3)} to{' '}
                      {(currentParam?.std_input_value + currentParam?.tolerance_plus).toFixed(3)} {currentParam?.unit}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {results[currentStep] && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentParam?.tolerance_type === "range" && results[currentStep].error !== undefined && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Error</label>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className={`font-bold ${results[currentStep].error! > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {results[currentStep].error! > 0 ? '+' : ''}{results[currentStep].error!.toFixed(3)} {currentParam?.unit}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Result</label>
                    <div className="flex items-center space-x-2">
                      {results[currentStep].pass ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          PASS
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          FAIL
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
              <Button 
                onClick={nextStep}
                disabled={observations[currentStep] === undefined}
              >
                {currentStep === deviceParameters.length - 1 ? "Complete Calibration" : "Next Step"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Results Summary */
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FlaskConical className="h-5 w-5" />
                <span>Calibration Results</span>
              </CardTitle>
              <CardDescription>
                Summary of all calibration measurements for {customer?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deviceParameters.map((param: any, index: number) => {
                  const result = results[index];
                  const observation = observations[index];
                  return (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                      <div>
                        <p className="text-sm text-slate-600">Step {index + 1}</p>
                        <p className="font-medium">{param.description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">
                          {param.tolerance_type === "go-nogo" ? "Expected" : "Standard"}
                        </p>
                        <p className="font-medium">
                          {param.tolerance_type === "go-nogo" 
                            ? param.expected_result 
                            : `${param.std_input_value} ${param.unit}`
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Observed</p>
                        <p className="font-medium">
                          {param.tolerance_type === "go-nogo" 
                            ? observation 
                            : `${observation} ${param.unit}`
                          }
                        </p>
                      </div>
                      {param.tolerance_type === "range" && (
                        <div>
                          <p className="text-sm text-slate-600">Error</p>
                          <p className={`font-medium ${result?.error! > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {result?.error! > 0 ? '+' : ''}{result?.error!.toFixed(3)} {param.unit}
                          </p>
                        </div>
                      )}
                      <div>
                        {result?.pass ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            PASS
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            FAIL
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {allPassed ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800">Calibration PASSED</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="text-red-800">Calibration FAILED</span>
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {allPassed 
                  ? "All measurements are within acceptable tolerance limits."
                  : "One or more measurements exceed tolerance limits. Device requires adjustment."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Button onClick={generateCertificate}>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Certificate
                </Button>
                <Button variant="outline" onClick={() => onDeviceSelect(null)}>
                  Calibrate Another Device
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Steps Overview */}
      {!calibrationComplete && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Calibration Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {deviceParameters.map((param: any, index: number) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${
                    index === currentStep 
                      ? 'bg-blue-50 border-blue-200' 
                      : index < currentStep 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Step {index + 1}: {param.description}</p>
                      <p className="text-sm text-slate-600">
                        {param.tolerance_type === "go-nogo" 
                          ? `Expected: ${param.expected_result}`
                          : `Standard: ${param.std_input_value} ${param.unit}`
                        }
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {index < currentStep && results[index] && (
                        results[index].pass ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )
                      )}
                      {index === currentStep && (
                        <Badge variant="outline">Current</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalibrationWorkflow;
