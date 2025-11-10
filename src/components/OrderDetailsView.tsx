"use client";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Phone, 
  Mail, 
  Truck,
  CheckCircle,
  Clock,
  FileText,
  UserPlus,
  Edit,
  Check,
  Image as ImageIcon,
  Upload,
  Send,
  X
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { toast } from "sonner";

interface OrderDetailsViewProps {
  orderId: string;
  onBack: () => void;
}

// Mock drivers for assignment
const mockDrivers = [
  { id: "DRV-001", name: "Sarah Driver", phone: "+1 305-555-0201", status: "Available", currentOrder: null, currentLoad: 0, totalCapacity: 8 },
  { id: "DRV-002", name: "Mike Driver", phone: "+1 305-555-0202", status: "En Route", currentOrder: "ORD-1003", currentLoad: 2, totalCapacity: 8 },
  { id: "DRV-003", name: "Tom Rodriguez", phone: "+1 305-555-0203", status: "Available", currentOrder: null, currentLoad: 0, totalCapacity: 10 },
  { id: "DRV-004", name: "Lisa Anderson", phone: "+1 305-555-0204", status: "Assigned", currentOrder: "ORD-2045 (+2 more)", currentLoad: 3, totalCapacity: 10 }
];

// Helper function to get driver status badge color
const getDriverStatusColor = (status: string) => {
  switch (status) {
    case "Available":
      return "bg-green-100 text-green-800 border-green-200";
    case "Assigned":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "En Route":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Off Duty":
      return "bg-slate-100 text-slate-800 border-slate-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

// Mock order data - in real app this would come from API/database
const getOrderDetails = (orderId: string) => ({
  id: orderId,
  orderNumber: orderId,
  status: "In Transit",
  createdDate: "2025-01-20",
  deliveryDate: "2025-01-25",
  estimatedDelivery: "2025-01-25 14:00",
  actualDelivery: null,
  
  // Customer Information
  customer: {
    id: "CUST-001",
    companyName: "Hilton Hotel Miami",
    contactName: "John Smith",
    email: "john@hilton.com",
    phone: "+1 305-555-0100",
    address: "1601 Collins Ave, Miami Beach, FL 33139",
    zone: "Zone A - Miami Beach",
    logo: "https://images.unsplash.com/photo-1740830351296-70cedfb237ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGxvZ298ZW58MXx8fHwxNzYxNjI2NzU1fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  
  // Order Items
  items: [
    {
      id: "1",
      productName: "Premium Coconut Water 330ml",
      sku: "COC-330-PREM",
      quantity: 100,
      unitPrice: 5.00,
      subtotal: 500.00
    },
    {
      id: "2",
      productName: "Organic Coconut Water 500ml",
      sku: "COC-500-ORG",
      quantity: 50,
      unitPrice: 7.50,
      subtotal: 375.00
    }
  ],
  
  // Pricing
  subtotal: 875.00,
  tax: 87.50,
  deliveryFee: 25.00,
  discount: 0,
  total: 987.50,
  
  // Payment Information
  payment: {
    method: "Credit Card",
    status: "Paid",
    paidDate: "2025-01-20 10:30",
    transactionId: "TXN-20250120-001"
  },
  
  // Delivery Information
  delivery: {
    driverName: "Mike Rodriguez",
    driverPhone: "+1 305-555-0200",
    vehicleNumber: "VAN-101",
    trackingNumber: "TRK-20250120-001",
    instructions: "Please deliver to loading dock at rear entrance"
  },
  
  // Notes
  notes: "Customer requested early morning delivery. Handle with care - fragile items.",
  
  // Status History
  statusHistory: [
    {
      status: "Order Placed",
      timestamp: "2025-01-20 10:30",
      description: "Order received and confirmed"
    },
    {
      status: "Processing",
      timestamp: "2025-01-20 14:00",
      description: "Order being prepared in warehouse"
    },
    {
      status: "Ready for Delivery",
      timestamp: "2025-01-22 09:00",
      description: "Order packed and ready for dispatch"
    },
    {
      status: "In Transit",
      timestamp: "2025-01-23 08:30",
      description: "Out for delivery with Mike Rodriguez"
    }
  ]
});

export function OrderDetailsView({ orderId, onBack }: OrderDetailsViewProps) {
  const order = getOrderDetails(orderId);
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "in transit":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const [open, setOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status);
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceEmail, setInvoiceEmail] = useState(order.customer.email);

  const handleStatusUpdate = () => {
    // In a real application, you would send this update to the server
    toast.success(`Order status updated to ${newStatus}`);
    setOpen(false);
  };

  const handleDriverAssignment = () => {
    if (!selectedDriverId) return;
    
    const driver = mockDrivers.find(d => d.id === selectedDriverId);
    if (driver) {
      toast.success(`Driver ${driver.name} assigned to ${order.orderNumber} successfully!`);
      setIsDriverDialogOpen(false);
      setSelectedDriverId("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is PDF
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setInvoiceFile(file);
      toast.success('Invoice file selected');
    }
  };

  const handleSendInvoice = () => {
    if (!invoiceFile) {
      toast.error('Please upload an invoice file first');
      return;
    }
    
    if (!invoiceEmail || !invoiceEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // In a real application, you would upload the file and send the email
    toast.success(`Invoice sent to ${invoiceEmail} successfully!`);
    setIsInvoiceDialogOpen(false);
    setInvoiceFile(null);
    setInvoiceEmail(order.customer.email);
  };

  const handleRemoveFile = () => {
    setInvoiceFile(null);
    toast.info('Invoice file removed');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl mb-1">Order Details</h1>
            <p className="text-slate-600">{order.orderNumber}</p>
          </div>
        </div>
        <Badge className={`px-4 py-2 text-sm ${getStatusColor(order.status)}`}>
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-sky-600" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Logo */}
              {order.customer.logo && (
                <div className="mb-4">
                  <div className="text-sm text-slate-500 mb-2">Company Logo</div>
                  <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-50">
                    <img 
                      src={order.customer.logo} 
                      alt={`${order.customer.companyName} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Company Name</div>
                  <div className="font-medium">{order.customer.companyName}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Contact Person</div>
                  <div className="font-medium">{order.customer.contactName}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </div>
                  <div className="font-medium text-sky-600">{order.customer.email}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Phone
                  </div>
                  <div className="font-medium">{order.customer.phone}</div>
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Delivery Address
                </div>
                <div className="font-medium">{order.customer.address}</div>
                <div className="text-sm text-slate-500 mt-1">{order.customer.zone}</div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-sky-600" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-slate-500">SKU: {item.sku}</div>
                      <div className="text-sm text-slate-600 mt-1">
                        Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">${item.subtotal.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax (10%)</span>
                  <span className="font-medium">${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Delivery Fee</span>
                  <span className="font-medium">${order.deliveryFee.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-${order.discount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-xl text-sky-600">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-sky-600" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Driver Name</div>
                  <div className="font-medium">{order.delivery.driverName}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Driver Phone</div>
                  <div className="font-medium">{order.delivery.driverPhone}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Vehicle Number</div>
                  <div className="font-medium">{order.delivery.vehicleNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Tracking Number</div>
                  <div className="font-medium text-sky-600">{order.delivery.trackingNumber}</div>
                </div>
              </div>
              {order.delivery.instructions && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Delivery Instructions</div>
                    <div className="font-medium bg-blue-50 p-3 rounded-lg text-sm">
                      {order.delivery.instructions}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-600" />
                  Order Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <p className="text-sm">{order.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-slate-500 mb-1">Order Date</div>
                <div className="font-medium">{order.createdDate}</div>
              </div>
              <Separator />
              <div>
                <div className="text-sm text-slate-500 mb-1">Estimated Delivery</div>
                <div className="font-medium">{order.estimatedDelivery}</div>
              </div>
              {order.actualDelivery && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Actual Delivery</div>
                    <div className="font-medium text-green-600">{order.actualDelivery}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-sky-600" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-slate-500 mb-1">Payment Status</div>
                <Badge className={order.payment.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                  {order.payment.status}
                </Badge>
              </div>
              {order.payment.paidDate && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Paid On</div>
                    <div className="font-medium">{order.payment.paidDate}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-600" />
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="relative pl-6">
                    {index !== order.statusHistory.length - 1 && (
                      <div className="absolute left-2 top-6 bottom-0 w-px bg-slate-200" />
                    )}
                    <div className="absolute left-0 top-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{history.status}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{history.timestamp}</div>
                      <div className="text-xs text-slate-600 mt-1">{history.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" onClick={() => setIsDriverDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Assign/Reassign Driver
              </Button>
              <Button className="w-full gradient-primary text-white hover:opacity-90" onClick={() => setIsInvoiceDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload and Send Invoice
              </Button>
              <Button className="w-full" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Email Customer
              </Button>
              <Button className="w-full" variant="secondary" onClick={() => setOpen(true)}>
                <Package className="w-4 h-4 mr-2" />
                Update Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of this order to reflect its current state.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="status">Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Order Placed">Order Placed</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Ready for Delivery">Ready for Delivery</SelectItem>
                <SelectItem value="In Transit">In Transit</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Driver Dialog */}
      <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Driver to Order</DialogTitle>
            <DialogDescription>
              Select an available driver to assign to {orderId}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid gap-2">
              <Label>Available Drivers</Label>
              <div className="space-y-2">
                {mockDrivers.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => setSelectedDriverId(driver.id)}
                    disabled={driver.status === "En Route" || driver.status === "Assigned"}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      driver.status === "En Route" || driver.status === "Assigned"
                        ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                        : selectedDriverId === driver.id
                        ? 'border-sky-500 bg-sky-50 cursor-pointer'
                        : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{driver.name}</span>
                          <Badge className={`text-xs ${getDriverStatusColor(driver.status)}`}>
                            {driver.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600">{driver.phone}</div>
                      </div>
                      {selectedDriverId === driver.id && driver.status === "Available" && (
                        <Check className="w-5 h-5 text-sky-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="text-blue-700 mt-0.5">ℹ️</div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Driver Status Guide:</p>
                  <ul className="text-xs space-y-0.5 text-blue-700">
                    <li><span className="font-medium">Available:</span> Ready for new assignments</li>
                    <li><span className="font-medium">Assigned:</span> Order assigned but not yet dispatched</li>
                    <li><span className="font-medium">En Route:</span> Currently delivering an order</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDriverDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleDriverAssignment}
              disabled={!selectedDriverId}
            >
              Assign Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload and Send Invoice Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-sky-600" />
              Upload and Send Invoice
            </DialogTitle>
            <DialogDescription>
              Upload the invoice PDF and send it to {order.customer.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Customer Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm text-blue-900">{order.customer.companyName}</span>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="invoice-email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-600" />
                Send Invoice To
              </Label>
              <Input
                id="invoice-email"
                type="email"
                placeholder="customer@example.com"
                value={invoiceEmail}
                onChange={(e) => setInvoiceEmail(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-slate-500">
                Default: {order.customer.email} (You can change this if needed)
              </p>
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <Label>Invoice File (PDF only, max 10MB)</Label>
              {!invoiceFile ? (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-600">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">PDF files only (MAX. 10MB)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-green-900">{invoiceFile.name}</p>
                      <p className="text-xs text-green-600">
                        {(invoiceFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Info Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="text-amber-700 mt-0.5">⚠️</div>
                <div className="text-xs text-amber-800">
                  <p className="font-medium mb-1">Before sending:</p>
                  <ul className="space-y-0.5 text-amber-700">
                    <li>• Verify the invoice details are correct</li>
                    <li>• Ensure the PDF is properly formatted</li>
                    <li>• The invoice will be sent immediately to the customer</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setIsInvoiceDialogOpen(false);
              setInvoiceFile(null);
              setInvoiceEmail(order.customer.email);
            }}>
              Cancel
            </Button>
            <Button 
              type="button" 
              className="gradient-primary text-white"
              onClick={handleSendInvoice}
              disabled={!invoiceFile}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}