"use client";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Plus, Edit, Trash2, Clock, MapPin, Package } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface DeliveryRulesManagementProps {
  locationId: string;
  locationName: string;
}

interface QuantityBasedRule {
  id: string;
  minQty: number;
  maxQty: number;
  deliveryOffset: number; // Days
  status: "Active" | "Inactive";
}

interface ZoneBasedRule {
  id: string;
  zoneName: string;
  cutoffTime: string; // Format: "HH:MM" in 24-hour
  nextDayOffset: number; // 1 = next day, 2 = day after tomorrow
  afterCutoffOffset: number; // Delivery offset when ordered after cutoff
  status: "Active" | "Inactive";
}

interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  description?: string;
  status: "Active" | "Inactive";
}

const defaultQuantityRules: QuantityBasedRule[] = [
  { id: "q1", minQty: 1, maxQty: 100, deliveryOffset: 1, status: "Active" },
  { id: "q2", minQty: 101, maxQty: 200, deliveryOffset: 2, status: "Active" },
  { id: "q3", minQty: 201, maxQty: 300, deliveryOffset: 3, status: "Active" },
];

const defaultZoneRules: ZoneBasedRule[] = [
  {
    id: "1",
    zoneName: "Zone A - Miami Beach",
    cutoffTime: "14:00",
    nextDayOffset: 1,
    afterCutoffOffset: 2,
    status: "Active"
  },
  {
    id: "2",
    zoneName: "Zone B - Downtown",
    cutoffTime: "12:00",
    nextDayOffset: 1,
    afterCutoffOffset: 2,
    status: "Active"
  },
  {
    id: "3",
    zoneName: "Zone C - Airport Area",
    cutoffTime: "15:00",
    nextDayOffset: 1,
    afterCutoffOffset: 2,
    status: "Active"
  }
];

const defaultDeliveryZones: DeliveryZone[] = [
  {
    id: "zone-1",
    name: "Zone A - Miami Beach",
    fee: 5.00,
    description: "Coastal area including Miami Beach and surrounding neighborhoods",
    status: "Active"
  },
  {
    id: "zone-2",
    name: "Zone B - Downtown",
    fee: 7.50,
    description: "Downtown Miami and Brickell area",
    status: "Active"
  },
  {
    id: "zone-3",
    name: "Zone C - Suburbs",
    fee: 10.00,
    description: "Suburban areas including Kendall, Doral, and Aventura",
    status: "Active"
  }
];

export function DeliveryRulesManagement() {
  // Quantity-based rules state
  const [quantityRules, setQuantityRules] = useState<QuantityBasedRule[]>(defaultQuantityRules);
  const [isAddQtyDialogOpen, setIsAddQtyDialogOpen] = useState(false);
  const [isEditQtyDialogOpen, setIsEditQtyDialogOpen] = useState(false);
  const [currentQtyRule, setCurrentQtyRule] = useState<QuantityBasedRule | null>(null);
  const [qtyFormData, setQtyFormData] = useState({
    minQty: 0,
    maxQty: 0,
    deliveryOffset: 1,
    status: "Active" as "Active" | "Inactive"
  });

  // Zone-based rules state
  const [zoneRules, setZoneRules] = useState<ZoneBasedRule[]>(defaultZoneRules);
  const [isAddZoneDialogOpen, setIsAddZoneDialogOpen] = useState(false);
  const [isEditZoneDialogOpen, setIsEditZoneDialogOpen] = useState(false);
  const [currentZoneRule, setCurrentZoneRule] = useState<ZoneBasedRule | null>(null);
  const [zoneFormData, setZoneFormData] = useState({
    zoneName: "",
    cutoffTime: "",
    nextDayOffset: 1,
    afterCutoffOffset: 2,
    status: "Active" as "Active" | "Inactive"
  });

  // Delivery zones state
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(defaultDeliveryZones);
  const [isAddDeliveryZoneDialogOpen, setIsAddDeliveryZoneDialogOpen] = useState(false);
  const [isEditDeliveryZoneDialogOpen, setIsEditDeliveryZoneDialogOpen] = useState(false);
  const [currentDeliveryZone, setCurrentDeliveryZone] = useState<DeliveryZone | null>(null);
  const [deliveryZoneFormData, setDeliveryZoneFormData] = useState({
    name: "",
    fee: 0,
    description: "",
    status: "Active" as "Active" | "Inactive"
  });

  const formatTimeDisplay = (time24: string) => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleAddQuantityRule = () => {
    if (qtyFormData.minQty >= qtyFormData.maxQty) {
      toast.error("Invalid quantity range", {
        description: "Minimum quantity must be less than maximum quantity.",
        duration: 2000,
      });
      return;
    }

    const newRule: QuantityBasedRule = {
      id: Date.now().toString(),
      minQty: qtyFormData.minQty,
      maxQty: qtyFormData.maxQty,
      deliveryOffset: qtyFormData.deliveryOffset,
      status: qtyFormData.status
    };

    setQuantityRules([...quantityRules, newRule]);
    setIsAddQtyDialogOpen(false);
    resetQtyForm();
    toast.success("Quantity-based delivery rule added!", {
      description: `Rule for ${qtyFormData.minQty}-${qtyFormData.maxQty} units has been created.`,
      duration: 3000,
    });
  };

  const handleEditQuantityRule = () => {
    if (!currentQtyRule || qtyFormData.minQty >= qtyFormData.maxQty) {
      toast.error("Invalid quantity range", {
        description: "Minimum quantity must be less than maximum quantity.",
        duration: 2000,
      });
      return;
    }

    setQuantityRules(quantityRules.map(rule =>
      rule.id === currentQtyRule.id
        ? {
            ...rule,
            minQty: qtyFormData.minQty,
            maxQty: qtyFormData.maxQty,
            deliveryOffset: qtyFormData.deliveryOffset,
            status: qtyFormData.status
          }
        : rule
    ));

    setIsEditQtyDialogOpen(false);
    setCurrentQtyRule(null);
    resetQtyForm();
    toast.success("Quantity-based delivery rule updated!", {
      description: `Rule for ${qtyFormData.minQty}-${qtyFormData.maxQty} units has been updated.`,
      duration: 3000,
    });
  };

  const handleDeleteQuantityRule = (id: string) => {
    const rule = quantityRules.find(r => r.id === id);
    setQuantityRules(quantityRules.filter(r => r.id !== id));
    toast.success("Quantity-based delivery rule deleted!", {
      description: `Rule for ${rule?.minQty}-${rule?.maxQty} units has been removed.`,
      duration: 2000,
    });
  };

  const openEditQuantityDialog = (rule: QuantityBasedRule) => {
    setCurrentQtyRule(rule);
    setQtyFormData({
      minQty: rule.minQty,
      maxQty: rule.maxQty,
      deliveryOffset: rule.deliveryOffset,
      status: rule.status
    });
    setIsEditQtyDialogOpen(true);
  };

  const openAddQuantityDialog = () => {
    resetQtyForm();
    setIsAddQtyDialogOpen(true);
  };

  const resetQtyForm = () => {
    setQtyFormData({
      minQty: 0,
      maxQty: 0,
      deliveryOffset: 1,
      status: "Active"
    });
  };

  const handleAddZoneRule = () => {
    if (!zoneFormData.zoneName || !zoneFormData.cutoffTime) {
      toast.error("Required fields missing", {
        description: "Please fill in zone name and cutoff time.",
        duration: 2000,
      });
      return;
    }

    const newRule: ZoneBasedRule = {
      id: Date.now().toString(),
      zoneName: zoneFormData.zoneName,
      cutoffTime: zoneFormData.cutoffTime,
      nextDayOffset: zoneFormData.nextDayOffset,
      afterCutoffOffset: zoneFormData.afterCutoffOffset,
      status: zoneFormData.status
    };

    setZoneRules([...zoneRules, newRule]);
    setIsAddZoneDialogOpen(false);
    resetZoneForm();
    toast.success("Zone-based delivery rule added!", {
      description: `Rule for ${zoneFormData.zoneName} has been created.`,
      duration: 3000,
    });
  };

  const handleEditZoneRule = () => {
    if (!currentZoneRule || !zoneFormData.zoneName || !zoneFormData.cutoffTime) {
      toast.error("Required fields missing", {
        description: "Please fill in zone name and cutoff time.",
        duration: 2000,
      });
      return;
    }

    setZoneRules(zoneRules.map(rule =>
      rule.id === currentZoneRule.id
        ? {
            ...rule,
            zoneName: zoneFormData.zoneName,
            cutoffTime: zoneFormData.cutoffTime,
            nextDayOffset: zoneFormData.nextDayOffset,
            afterCutoffOffset: zoneFormData.afterCutoffOffset,
            status: zoneFormData.status
          }
        : rule
    ));

    setIsEditZoneDialogOpen(false);
    setCurrentZoneRule(null);
    resetZoneForm();
    toast.success("Zone-based delivery rule updated!", {
      description: `Rule for ${zoneFormData.zoneName} has been updated.`,
      duration: 3000,
    });
  };

  const handleDeleteZoneRule = (id: string) => {
    const rule = zoneRules.find(r => r.id === id);
    setZoneRules(zoneRules.filter(r => r.id !== id));
    toast.success("Zone-based delivery rule deleted!", {
      description: `Rule for ${rule?.zoneName} has been removed.`,
      duration: 2000,
    });
  };

  const openEditZoneDialog = (rule: ZoneBasedRule) => {
    setCurrentZoneRule(rule);
    setZoneFormData({
      zoneName: rule.zoneName,
      cutoffTime: rule.cutoffTime,
      nextDayOffset: rule.nextDayOffset,
      afterCutoffOffset: rule.afterCutoffOffset,
      status: rule.status
    });
    setIsEditZoneDialogOpen(true);
  };

  const openAddZoneDialog = () => {
    resetZoneForm();
    setIsAddZoneDialogOpen(true);
  };

  const resetZoneForm = () => {
    setZoneFormData({
      zoneName: "",
      cutoffTime: "",
      nextDayOffset: 1,
      afterCutoffOffset: 2,
      status: "Active"
    });
  };

  // Delivery Zone Management Handlers
  const handleAddDeliveryZone = () => {
    if (!deliveryZoneFormData.name || deliveryZoneFormData.fee <= 0) {
      toast.error("Required fields missing", {
        description: "Please fill in zone name and delivery fee.",
        duration: 2000,
      });
      return;
    }

    const newZone: DeliveryZone = {
      id: `zone-${Date.now()}`,
      name: deliveryZoneFormData.name,
      fee: deliveryZoneFormData.fee,
      description: deliveryZoneFormData.description,
      status: deliveryZoneFormData.status
    };

    setDeliveryZones([...deliveryZones, newZone]);
    setIsAddDeliveryZoneDialogOpen(false);
    resetDeliveryZoneForm();
    toast.success("Delivery zone added!", {
      description: `${deliveryZoneFormData.name} has been created.`,
      duration: 3000,
    });
  };

  const handleEditDeliveryZone = () => {
    if (!currentDeliveryZone || !deliveryZoneFormData.name || deliveryZoneFormData.fee <= 0) {
      toast.error("Required fields missing", {
        description: "Please fill in zone name and delivery fee.",
        duration: 2000,
      });
      return;
    }

    setDeliveryZones(deliveryZones.map(zone =>
      zone.id === currentDeliveryZone.id
        ? {
            ...zone,
            name: deliveryZoneFormData.name,
            fee: deliveryZoneFormData.fee,
            description: deliveryZoneFormData.description,
            status: deliveryZoneFormData.status
          }
        : zone
    ));

    setIsEditDeliveryZoneDialogOpen(false);
    setCurrentDeliveryZone(null);
    resetDeliveryZoneForm();
    toast.success("Delivery zone updated!", {
      description: `${deliveryZoneFormData.name} has been updated.`,
      duration: 3000,
    });
  };

  const handleDeleteDeliveryZone = (id: string) => {
    const zone = deliveryZones.find(z => z.id === id);
    setDeliveryZones(deliveryZones.filter(z => z.id !== id));
    toast.success("Delivery zone deleted!", {
      description: `${zone?.name} has been removed.`,
      duration: 2000,
    });
  };

  const openEditDeliveryZoneDialog = (zone: DeliveryZone) => {
    setCurrentDeliveryZone(zone);
    setDeliveryZoneFormData({
      name: zone.name,
      fee: zone.fee,
      description: zone.description || "",
      status: zone.status
    });
    setIsEditDeliveryZoneDialogOpen(true);
  };

  const openAddDeliveryZoneDialog = () => {
    resetDeliveryZoneForm();
    setIsAddDeliveryZoneDialogOpen(true);
  };

  const resetDeliveryZoneForm = () => {
    setDeliveryZoneFormData({
      name: "",
      fee: 0,
      description: "",
      status: "Active"
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Delivery Rules</h1>
        {/* <p className="text-slate-600">{locationName}</p> */}
      </div>

      {/* Add Rule Button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">
          Configure delivery date calculation rules based on order quantity and customer zones
        </p>
        <div className="flex gap-2">
          <Button onClick={openAddQuantityDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Quantity Rule
          </Button>
          <Button onClick={openAddZoneDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Zone Rule
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-sky-50 border-sky-200">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Package className="w-5 h-5 text-sky-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm">
                  <strong>Quantity-based Rules:</strong> Define delivery times based on order quantity.
                </p>
                <p className="text-xs text-slate-600">
                  Example: 1-100 cases = next day; 101-200 cases = 2 days later; 201-300 cases = 3 days later.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-sky-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm">
                  <strong>Zone-based Rules:</strong> Define delivery times based on customer zone and order cutoff time.
                </p>
                <p className="text-xs text-slate-600">
                  Example: If Zone A has a 2:00 PM cutoff, orders before 2 PM get next-day delivery, orders after 2 PM get day-after-tomorrow delivery.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-sky-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm">
                  <strong>Delivery Zones:</strong> Manage delivery zones and their associated delivery fees.
                </p>
                <p className="text-xs text-slate-600">
                  Example: Zone A - Miami Beach ($5.00), Zone B - Downtown ($7.50), Zone C - Suburbs ($10.00).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <Tabs defaultValue="quantity">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quantity">Quantity-based Rules</TabsTrigger>
          <TabsTrigger value="zone">Zone-based Rules</TabsTrigger>
          <TabsTrigger value="delivery-zones">Delivery Zones</TabsTrigger>
        </TabsList>
        <TabsContent value="quantity">
          <div className="grid gap-4">
            {quantityRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">
                          Quantity-based
                        </Badge>
                        <Badge variant={rule.status === "Active" ? "default" : "outline"}>
                          {rule.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            Quantity Range
                          </div>
                          <div className="text-lg">{rule.minQty}-{rule.maxQty} units</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Delivery Offset</div>
                          <div className="text-lg">{rule.deliveryOffset} {rule.deliveryOffset === 1 ? 'day' : 'days'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Status</div>
                          <div className="text-sm mt-1">
                            {rule.status === "Active" ? (
                              <span className="text-green-600">● Active</span>
                            ) : (
                              <span className="text-slate-400">● Inactive</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Delivery Timeline */}
                      <div className="pt-3 border-t">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-xs text-blue-700 mb-1">Delivery Time</div>
                          <div className="text-sm">
                            Orders within this range will be delivered in <strong>{rule.deliveryOffset} {rule.deliveryOffset === 1 ? 'day' : 'days'}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => openEditQuantityDialog(rule)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteQuantityRule(rule.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="zone">
          <div className="grid gap-4">
            {zoneRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">
                          Zone-based
                        </Badge>
                        <Badge variant={rule.status === "Active" ? "default" : "outline"}>
                          {rule.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Zone Name
                          </div>
                          <div className="text-lg">{rule.zoneName}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Cutoff Time
                          </div>
                          <div className="text-lg">{formatTimeDisplay(rule.cutoffTime)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Status</div>
                          <div className="text-sm mt-1">
                            {rule.status === "Active" ? (
                              <span className="text-green-600">● Active</span>
                            ) : (
                              <span className="text-slate-400">● Inactive</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Delivery Timeline */}
                      <div className="pt-3 border-t grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-xs text-green-700 mb-1">Before {formatTimeDisplay(rule.cutoffTime)}</div>
                          <div className="text-sm">
                            Delivery in <strong>{rule.nextDayOffset} {rule.nextDayOffset === 1 ? 'day' : 'days'}</strong>
                          </div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="text-xs text-orange-700 mb-1">After {formatTimeDisplay(rule.cutoffTime)}</div>
                          <div className="text-sm">
                            Delivery in <strong>{rule.afterCutoffOffset} {rule.afterCutoffOffset === 1 ? 'day' : 'days'}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => openEditZoneDialog(rule)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteZoneRule(rule.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="delivery-zones">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">
                Manage delivery zones and their associated fees
              </p>
              <Button onClick={openAddDeliveryZoneDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Delivery Zone
              </Button>
            </div>
            <div className="grid gap-4">
              {deliveryZones.map((zone) => (
                <Card key={zone.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">
                            Delivery Zone
                          </Badge>
                          <Badge variant={zone.status === "Active" ? "default" : "outline"}>
                            {zone.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Zone Name
                            </div>
                            <div className="text-lg">{zone.name}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">Delivery Fee</div>
                            <div className="text-lg">${zone.fee.toFixed(2)}</div>
                          </div>
                        </div>

                        {zone.description && (
                          <div className="pt-3 border-t">
                            <div className="text-xs text-slate-500 mb-1">Description</div>
                            <div className="text-sm text-slate-700">{zone.description}</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="sm" onClick={() => openEditDeliveryZoneDialog(zone)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteDeliveryZone(zone.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Max Daily Amount */}
      <Card>
        <CardHeader>
          <CardTitle>Maximum Daily Amount Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-slate-600 mb-2">
                Orders exceeding this amount will be pushed to the following day
              </p>
              <div className="flex items-center gap-2">
                <span>Max Daily Amount:</span>
                <input
                  type="number"
                  defaultValue="500"
                  className="border rounded px-3 py-1 w-32"
                />
                <span>units</span>
              </div>
            </div>
            <Button>Update</Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Quantity Rule Dialog */}
      <Dialog open={isAddQtyDialogOpen} onOpenChange={setIsAddQtyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Quantity-based Delivery Rule</DialogTitle>
            <DialogDescription>
              Configure a new delivery rule based on quantity range.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="minQty">Minimum Quantity</Label>
              <Input
                id="minQty"
                type="number"
                value={qtyFormData.minQty}
                onChange={(e) => setQtyFormData({ ...qtyFormData, minQty: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxQty">Maximum Quantity</Label>
              <Input
                id="maxQty"
                type="number"
                value={qtyFormData.maxQty}
                onChange={(e) => setQtyFormData({ ...qtyFormData, maxQty: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryOffset">Delivery Offset</Label>
              <Select
                value={qtyFormData.deliveryOffset.toString()}
                onValueChange={(value) => setQtyFormData({ ...qtyFormData, deliveryOffset: parseInt(value) })}
              >
                <SelectTrigger id="deliveryOffset">
                  <SelectValue placeholder="Select a day offset">
                    {qtyFormData.deliveryOffset}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={qtyFormData.status}
                onValueChange={(value) => setQtyFormData({ ...qtyFormData, status: value as "Active" | "Inactive" })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select a status">
                    {qtyFormData.status}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsAddQtyDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddQuantityRule}>
              Add Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Quantity Rule Dialog */}
      <Dialog open={isEditQtyDialogOpen} onOpenChange={setIsEditQtyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Quantity-based Delivery Rule</DialogTitle>
            <DialogDescription>
              Update the delivery rule based on quantity range.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="minQty">Minimum Quantity</Label>
              <Input
                id="minQty"
                type="number"
                value={qtyFormData.minQty}
                onChange={(e) => setQtyFormData({ ...qtyFormData, minQty: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxQty">Maximum Quantity</Label>
              <Input
                id="maxQty"
                type="number"
                value={qtyFormData.maxQty}
                onChange={(e) => setQtyFormData({ ...qtyFormData, maxQty: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryOffset">Delivery Offset</Label>
              <Select
                value={qtyFormData.deliveryOffset.toString()}
                onValueChange={(value) => setQtyFormData({ ...qtyFormData, deliveryOffset: parseInt(value) })}
              >
                <SelectTrigger id="deliveryOffset">
                  <SelectValue placeholder="Select a day offset">
                    {qtyFormData.deliveryOffset}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={qtyFormData.status}
                onValueChange={(value) => setQtyFormData({ ...qtyFormData, status: value as "Active" | "Inactive" })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select a status">
                    {qtyFormData.status}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsEditQtyDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleEditQuantityRule}>
              Update Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Zone Rule Dialog */}
      <Dialog open={isAddZoneDialogOpen} onOpenChange={setIsAddZoneDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Zone-based Delivery Rule</DialogTitle>
            <DialogDescription>
              Configure a new delivery rule for a specific zone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zoneName">Zone Name</Label>
              <Input
                id="zoneName"
                placeholder="Zone A - Miami Beach"
                value={zoneFormData.zoneName}
                onChange={(e) => setZoneFormData({ ...zoneFormData, zoneName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cutoffTime">Cutoff Time</Label>
              <Input
                id="cutoffTime"
                type="time"
                value={zoneFormData.cutoffTime}
                onChange={(e) => setZoneFormData({ ...zoneFormData, cutoffTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextDayOffset">Next Day Offset</Label>
              <Select
                value={zoneFormData.nextDayOffset.toString()}
                onValueChange={(value) => setZoneFormData({ ...zoneFormData, nextDayOffset: parseInt(value) })}
              >
                <SelectTrigger id="nextDayOffset">
                  <SelectValue placeholder="Select a day offset">
                    {zoneFormData.nextDayOffset}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="afterCutoffOffset">After Cutoff Offset</Label>
              <Select
                value={zoneFormData.afterCutoffOffset.toString()}
                onValueChange={(value) => setZoneFormData({ ...zoneFormData, afterCutoffOffset: parseInt(value) })}
              >
                <SelectTrigger id="afterCutoffOffset">
                  <SelectValue placeholder="Select a day offset">
                    {zoneFormData.afterCutoffOffset}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={zoneFormData.status}
                onValueChange={(value) => setZoneFormData({ ...zoneFormData, status: value as "Active" | "Inactive" })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select a status">
                    {zoneFormData.status}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsAddZoneDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddZoneRule}>
              Add Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Zone Rule Dialog */}
      <Dialog open={isEditZoneDialogOpen} onOpenChange={setIsEditZoneDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Zone-based Delivery Rule</DialogTitle>
            <DialogDescription>
              Update the delivery rule for a specific zone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zoneName">Zone Name</Label>
              <Input
                id="zoneName"
                placeholder="Zone A - Miami Beach"
                value={zoneFormData.zoneName}
                onChange={(e) => setZoneFormData({ ...zoneFormData, zoneName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cutoffTime">Cutoff Time</Label>
              <Input
                id="cutoffTime"
                type="time"
                value={zoneFormData.cutoffTime}
                onChange={(e) => setZoneFormData({ ...zoneFormData, cutoffTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextDayOffset">Next Day Offset</Label>
              <Select
                value={zoneFormData.nextDayOffset.toString()}
                onValueChange={(value) => setZoneFormData({ ...zoneFormData, nextDayOffset: parseInt(value) })}
              >
                <SelectTrigger id="nextDayOffset">
                  <SelectValue placeholder="Select a day offset">
                    {zoneFormData.nextDayOffset}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="afterCutoffOffset">After Cutoff Offset</Label>
              <Select
                value={zoneFormData.afterCutoffOffset.toString()}
                onValueChange={(value) => setZoneFormData({ ...zoneFormData, afterCutoffOffset: parseInt(value) })}
              >
                <SelectTrigger id="afterCutoffOffset">
                  <SelectValue placeholder="Select a day offset">
                    {zoneFormData.afterCutoffOffset}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={zoneFormData.status}
                onValueChange={(value) => setZoneFormData({ ...zoneFormData, status: value as "Active" | "Inactive" })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select a status">
                    {zoneFormData.status}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsEditZoneDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleEditZoneRule}>
              Update Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Delivery Zone Dialog */}
      <Dialog open={isAddDeliveryZoneDialogOpen} onOpenChange={setIsAddDeliveryZoneDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Delivery Zone</DialogTitle>
            <DialogDescription>
              Create a new delivery zone with a name and delivery fee.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zoneName">Zone Name <span className="text-red-500">*</span></Label>
              <Input
                id="zoneName"
                placeholder="e.g., Zone A - Miami Beach"
                value={deliveryZoneFormData.name}
                onChange={(e) => setDeliveryZoneFormData({ ...deliveryZoneFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zoneFee">Delivery Fee ($) <span className="text-red-500">*</span></Label>
              <Input
                id="zoneFee"
                type="number"
                placeholder="10.00"
                step="0.01"
                value={deliveryZoneFormData.fee || ""}
                onChange={(e) => setDeliveryZoneFormData({ ...deliveryZoneFormData, fee: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zoneDescription">Description (Optional)</Label>
              <Input
                id="zoneDescription"
                placeholder="e.g., Coastal area including Miami Beach"
                value={deliveryZoneFormData.description}
                onChange={(e) => setDeliveryZoneFormData({ ...deliveryZoneFormData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zoneStatus">Status</Label>
              <Select
                value={deliveryZoneFormData.status}
                onValueChange={(value) => setDeliveryZoneFormData({ ...deliveryZoneFormData, status: value as "Active" | "Inactive" })}
              >
                <SelectTrigger id="zoneStatus">
                  <SelectValue placeholder="Select a status">
                    {deliveryZoneFormData.status}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDeliveryZoneDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddDeliveryZone}>
              Add Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Delivery Zone Dialog */}
      <Dialog open={isEditDeliveryZoneDialogOpen} onOpenChange={setIsEditDeliveryZoneDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Delivery Zone</DialogTitle>
            <DialogDescription>
              Update the delivery zone information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editZoneName">Zone Name <span className="text-red-500">*</span></Label>
              <Input
                id="editZoneName"
                placeholder="e.g., Zone A - Miami Beach"
                value={deliveryZoneFormData.name}
                onChange={(e) => setDeliveryZoneFormData({ ...deliveryZoneFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editZoneFee">Delivery Fee ($) <span className="text-red-500">*</span></Label>
              <Input
                id="editZoneFee"
                type="number"
                placeholder="10.00"
                step="0.01"
                value={deliveryZoneFormData.fee || ""}
                onChange={(e) => setDeliveryZoneFormData({ ...deliveryZoneFormData, fee: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editZoneDescription">Description (Optional)</Label>
              <Input
                id="editZoneDescription"
                placeholder="e.g., Coastal area including Miami Beach"
                value={deliveryZoneFormData.description}
                onChange={(e) => setDeliveryZoneFormData({ ...deliveryZoneFormData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editZoneStatus">Status</Label>
              <Select
                value={deliveryZoneFormData.status}
                onValueChange={(value) => setDeliveryZoneFormData({ ...deliveryZoneFormData, status: value as "Active" | "Inactive" })}
              >
                <SelectTrigger id="editZoneStatus">
                  <SelectValue placeholder="Select a status">
                    {deliveryZoneFormData.status}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDeliveryZoneDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleEditDeliveryZone}>
              Update Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}