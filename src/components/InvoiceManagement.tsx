"use client";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Download, Eye, User, MapPin, Phone, Mail, Package, DollarSign, FileText, Calendar, Plus, Trash2, Upload, Check, ChevronsUpDown, Send } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { toast } from "sonner";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";

interface InvoiceManagementProps {
  locationId: string;
  locationName: string;
}

const mockInvoices = [
  {
    id: "INV-2025-001",
    orderId: "ORD-1001",
    customerCompany: "Hilton Hotel Miami",
    fileName: "invoice_001.pdf",
    poNumber: "PO-2025-001",
    amount: 750.00,
    paymentStatus: "Pending",
    uploadDate: "2025-01-20",
    uploadedBy: "Tom Accounting",
    // Extended details
    customer: {
      contactName: "John Smith",
      email: "john@hilton.com",
      phone: "+1 305-555-0100",
      address: "1601 Collins Ave, Miami Beach, FL 33139",
      zone: "Zone A - Miami Beach"
    },
    orderDate: "2025-01-18",
    deliveryDate: "2025-01-20",
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
        unitPrice: 5.00,
        subtotal: 250.00
      }
    ],
    subtotal: 750.00,
    tax: 0,
    deliveryFee: 0,
    discount: 0,
    total: 750.00,
    payment: {
      method: "Credit Card",
      status: "Pending",
      paidDate: null,
      transactionId: null,
      dueDate: "2025-02-04"
    }
  },
  {
    id: "INV-2025-002",
    orderId: "ORD-1002",
    customerCompany: "Ocean View Restaurant",
    fileName: "invoice_002.pdf",
    poNumber: null,
    amount: 375.00,
    paymentStatus: "Paid",
    uploadDate: "2025-01-20",
    uploadedBy: "Tom Accounting",
    // Extended details
    customer: {
      contactName: "Sarah Johnson",
      email: "sarah@oceanview.com",
      phone: "+1 305-555-0200",
      address: "Ocean Drive, Miami Beach, FL 33139",
      zone: "Zone A - Miami Beach"
    },
    orderDate: "2025-01-19",
    deliveryDate: "2025-01-20",
    items: [
      {
        id: "1",
        productName: "Premium Coconut Water 330ml",
        sku: "COC-330-PREM",
        quantity: 75,
        unitPrice: 5.00,
        subtotal: 375.00
      }
    ],
    subtotal: 375.00,
    tax: 0,
    deliveryFee: 0,
    discount: 0,
    total: 375.00,
    payment: {
      method: "ACH Transfer",
      status: "Paid",
      paidDate: "2025-01-20 14:30",
      transactionId: "TXN-20250120-002",
      dueDate: "2025-02-04"
    }
  },
  {
    id: "INV-2025-003",
    orderId: "ORD-1003",
    customerCompany: "Paradise Events",
    fileName: "invoice_003.pdf",
    poNumber: "PO-PE-456",
    amount: 900.00,
    paymentStatus: "Pending",
    uploadDate: "2025-01-19",
    uploadedBy: "Tom Accounting",
    // Extended details
    customer: {
      contactName: "Mike Rodriguez",
      email: "mike@paradiseevents.com",
      phone: "+1 305-555-0300",
      address: "Brickell Ave, Miami, FL 33131",
      zone: "Zone B - Downtown Miami"
    },
    orderDate: "2025-01-17",
    deliveryDate: "2025-01-19",
    items: [
      {
        id: "1",
        productName: "Premium Coconut Water 330ml",
        sku: "COC-330-PREM",
        quantity: 120,
        unitPrice: 5.00,
        subtotal: 600.00
      },
      {
        id: "2",
        productName: "Organic Coconut Water 500ml",
        sku: "COC-500-ORG",
        quantity: 60,
        unitPrice: 5.00,
        subtotal: 300.00
      }
    ],
    subtotal: 900.00,
    tax: 0,
    deliveryFee: 0,
    discount: 0,
    total: 900.00,
    payment: {
      method: "Net 30",
      status: "Pending",
      paidDate: null,
      transactionId: null,
      dueDate: "2025-02-18"
    }
  }
];

const paymentStatusColors: Record<string, string> = {
  "Pending": "bg-yellow-100 text-yellow-800",
  "Paid": "bg-green-100 text-green-800",
  "Overdue": "bg-red-100 text-red-800"
};

// Mock customers for the dropdown
const mockCustomers = [
  { id: "CUST-001", name: "Hilton Hotel Miami", contact: "John Smith", email: "john@hilton.com" },
  { id: "CUST-002", name: "Ocean View Restaurant", contact: "Maria Garcia", email: "maria@oceanview.com" },
  { id: "CUST-003", name: "Paradise Events", contact: "David Johnson", email: "david@paradise.com" },
  { id: "CUST-004", name: "Sunset Beach Resort", contact: "Emily Chen", email: "emily@sunset.com" },
  { id: "CUST-005", name: "Downtown Cafe", contact: "Michael Brown", email: "michael@downtown.com" },
  { id: "CUST-006", name: "Grand Plaza Hotel", contact: "Sarah Williams", email: "sarah@grandplaza.com" },
];

// Mock orders for the selected customer
const mockCustomerOrders = [
  { id: "ORD-1001", customerId: "CUST-001", orderDate: "2025-01-18", amount: 750.00, status: "Completed" },
  { id: "ORD-1004", customerId: "CUST-001", orderDate: "2025-01-20", amount: 250.00, status: "Completed" },
  { id: "ORD-1002", customerId: "CUST-002", orderDate: "2025-01-19", amount: 375.00, status: "Completed" },
  { id: "ORD-1003", customerId: "CUST-003", orderDate: "2025-01-17", amount: 900.00, status: "Completed" },
  { id: "ORD-2001", customerId: "CUST-004", orderDate: "2025-01-21", amount: 450.00, status: "Completed" },
  { id: "ORD-2002", customerId: "CUST-005", orderDate: "2025-01-22", amount: 320.00, status: "Completed" },
];

export function InvoiceManagement() {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof mockInvoices[0] | null>(null);
  const [activeFilter, setActiveFilter] = useState<"All" | "Pending" | "Paid" | "Overdue">("All");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Create invoice form state
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [uploadedInvoiceFile, setUploadedInvoiceFile] = useState<File | null>(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);

  const handleViewInvoice = (invoice: typeof mockInvoices[0]) => {
    setSelectedInvoice(invoice);
    setIsViewDialogOpen(true);
  };

  const handleDownloadInvoice = (invoice: typeof mockInvoices[0]) => {
    // In a real app, this would trigger an actual download
    toast.success("Invoice downloaded!", {
      description: `${invoice.fileName} has been downloaded to your device.`,
      duration: 3000,
    });
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedInvoice(null);
  };

  // Filter invoices based on active filter
  const filteredInvoices = mockInvoices.filter((invoice) => {
    if (activeFilter === "All") return true;
    return invoice.paymentStatus === activeFilter;
  });

  // Get selected customer details
  const selectedCustomer = mockCustomers.find(c => c.id === selectedCustomerId);
  
  // Get orders for selected customer
  const customerOrders = selectedCustomerId 
    ? mockCustomerOrders.filter(o => o.customerId === selectedCustomerId)
    : [];
  
  // Get selected order details
  const selectedOrder = mockCustomerOrders.find(o => o.id === selectedOrderId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedInvoiceFile(file);
    }
  };

  const handleSendInvoice = () => {
    if (!selectedCustomerId || !selectedOrderId || !uploadedInvoiceFile) {
      toast.error("Please complete all steps", {
        description: "Select a customer, order, and upload an invoice file.",
        duration: 3000,
      });
      return;
    }

    // In real app, this would upload the file and send the invoice
    toast.success("Invoice sent successfully!", {
      description: `Invoice sent to ${selectedCustomer?.name}`,
      duration: 3000,
    });
    
    setIsCreateDialogOpen(false);
    // Reset form
    setSelectedCustomerId("");
    setSelectedOrderId("");
    setUploadedInvoiceFile(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Invoice Management</h1>
        {/* <p className="text-slate-600">{locationName}</p> */}
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant={activeFilter === "All" ? "default" : "outline"} 
            onClick={() => setActiveFilter("All")}
          >
            All Invoices
          </Button>
          <Button 
            variant={activeFilter === "Pending" ? "default" : "outline"} 
            onClick={() => setActiveFilter("Pending")}
          >
            Pending
          </Button>
          <Button 
            variant={activeFilter === "Paid" ? "default" : "outline"} 
            onClick={() => setActiveFilter("Paid")}
          >
            Paid
          </Button>
          <Button 
            variant={activeFilter === "Overdue" ? "default" : "outline"} 
            onClick={() => setActiveFilter("Overdue")}
          >
            Overdue
          </Button>
        </div>
        {/* <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload & Invoice
        </Button> */}
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeFilter === "All" ? "All Invoices" : `${activeFilter} Invoices`} ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>PO Number</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                  <TableCell className="font-mono text-sm">{invoice.orderId}</TableCell>
                  <TableCell>{invoice.customerCompany}</TableCell>
                  <TableCell className="text-sm">{invoice.poNumber || "-"}</TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${paymentStatusColors[invoice.paymentStatus]}`}>
                      {invoice.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{invoice.uploadDate}</TableCell>
                  <TableCell className="text-sm">{invoice.uploadedBy}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {/* <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice)}>
                        <Eye className="w-4 h-4" />
                      </Button> */}
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(invoice)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Invoice Details</span>
              {selectedInvoice && (
                <Badge className={`${paymentStatusColors[selectedInvoice.paymentStatus]}`}>
                  {selectedInvoice.paymentStatus}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedInvoice && (
                <>
                  <span className="font-mono">{selectedInvoice.id}</span>
                  <span> • </span>
                  <span>Order: {selectedInvoice.orderId}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
              <div className="space-y-6">
                {/* Invoice Information */}
                <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span className="font-medium">Invoice Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-slate-500">File Name</div>
                      <div className="font-medium">{selectedInvoice.fileName}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">PO Number</div>
                      <div className="font-medium">{selectedInvoice.poNumber || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Upload Date</div>
                      <div className="font-medium">{selectedInvoice.uploadDate}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Uploaded By</div>
                      <div className="font-medium">{selectedInvoice.uploadedBy}</div>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-sky-600" />
                    <span className="font-medium">Customer Information</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-slate-500">Company Name</div>
                        <div className="font-medium">{selectedInvoice.customerCompany}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Contact Person</div>
                        <div className="font-medium">{selectedInvoice.customer.contactName}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          Email
                        </div>
                        <div className="font-medium text-sky-600">{selectedInvoice.customer.email}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          Phone
                        </div>
                        <div className="font-medium">{selectedInvoice.customer.phone}</div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-slate-500 flex items-center gap-1 text-sm mb-1">
                        <MapPin className="w-3 h-3" />
                        Delivery Address
                      </div>
                      <div className="font-medium text-sm">{selectedInvoice.customer.address}</div>
                      <div className="text-sm text-slate-500 mt-1">{selectedInvoice.customer.zone}</div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-sky-600" />
                    <span className="font-medium">Order Items</span>
                  </div>
                  <div className="space-y-2">
                    {selectedInvoice.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.productName}</div>
                          <div className="text-xs text-slate-500">SKU: {item.sku}</div>
                          <div className="text-xs text-slate-600 mt-1">
                            Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)}
                          </div>
                        </div>
                        <div className="font-semibold">${item.subtotal.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-sky-600" />
                    <span className="font-medium">Price Breakdown</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium">${selectedInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    {selectedInvoice.tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Tax</span>
                        <span className="font-medium">${selectedInvoice.tax.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedInvoice.deliveryFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Delivery Fee</span>
                        <span className="font-medium">${selectedInvoice.deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedInvoice.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-${selectedInvoice.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between pt-2">
                      <span className="font-semibold">Total Amount</span>
                      <span className="font-bold text-xl text-sky-600">${selectedInvoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-sky-600" />
                    <span className="font-medium">Payment Information</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-slate-500">Payment Method</div>
                        <div className="font-medium">{selectedInvoice.payment.method}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Payment Status</div>
                        <Badge className={`${paymentStatusColors[selectedInvoice.payment.status]} mt-1`}>
                          {selectedInvoice.payment.status}
                        </Badge>
                      </div>
                      {selectedInvoice.payment.paidDate && (
                        <div>
                          <div className="text-slate-500">Paid On</div>
                          <div className="font-medium">{selectedInvoice.payment.paidDate}</div>
                        </div>
                      )}
                      {selectedInvoice.payment.transactionId && (
                        <div>
                          <div className="text-slate-500">Transaction ID</div>
                          <div className="font-medium font-mono text-xs text-sky-600">{selectedInvoice.payment.transactionId}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-slate-500">Due Date</div>
                        <div className="font-medium">{selectedInvoice.payment.dueDate}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Dates */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-sky-600" />
                    <span className="font-medium">Order Timeline</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-slate-500">Order Date</div>
                        <div className="font-medium">{selectedInvoice.orderDate}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Delivery Date</div>
                        <div className="font-medium">{selectedInvoice.deliveryDate}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => selectedInvoice && handleDownloadInvoice(selectedInvoice)}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handleCloseViewDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (!open) {
          // Reset form when closing
          setSelectedCustomerId("");
          setSelectedOrderId("");
          setUploadedInvoiceFile(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create & Send Invoice</DialogTitle>
            <DialogDescription>
              Select customer, order, upload invoice and send
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Step 1: Select Customer */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-sky-700">1</span>
                </div>
                <Label className="text-base">Select Customer</Label>
              </div>
              <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerSearchOpen}
                    className="w-full justify-between"
                  >
                    {selectedCustomer
                      ? `${selectedCustomer.name} - ${selectedCustomer.contact}`
                      : "Select customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search customer..." />
                    <CommandList>
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {mockCustomers.map((customer) => (
                          <CommandItem
                            key={customer.id}
                            value={customer.name}
                            onSelect={() => {
                              setSelectedCustomerId(customer.id);
                              setSelectedOrderId(""); // Reset order when customer changes
                              setCustomerSearchOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedCustomerId === customer.id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <div>
                              <div>{customer.name}</div>
                              <div className="text-xs text-slate-500">{customer.contact} • {customer.email}</div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Step 2: Select Order */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-sky-700">2</span>
                </div>
                <Label className="text-base">Select Order</Label>
              </div>
              <Select 
                value={selectedOrderId} 
                onValueChange={setSelectedOrderId}
                disabled={!selectedCustomerId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={selectedCustomerId ? "Select order..." : "Select customer first"} />
                </SelectTrigger>
                <SelectContent>
                  {customerOrders.length === 0 && selectedCustomerId && (
                    <SelectItem value="no-orders" disabled>No orders found</SelectItem>
                  )}
                  {customerOrders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.id} - {order.orderDate} - ${order.amount.toFixed(2)} - {order.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedOrder && (
                <div className="bg-slate-50 rounded-lg p-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500">Order ID:</span>
                      <span className="ml-2 font-mono font-medium">{selectedOrder.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Amount:</span>
                      <span className="ml-2 font-semibold">${selectedOrder.amount.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Date:</span>
                      <span className="ml-2">{selectedOrder.orderDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Status:</span>
                      <span className="ml-2">{selectedOrder.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Upload Invoice */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-sky-700">3</span>
                </div>
                <Label className="text-base">Upload Invoice File</Label>
              </div>
              
              {uploadedInvoiceFile ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{uploadedInvoiceFile.name}</div>
                      <div className="text-xs text-slate-500">
                        {(uploadedInvoiceFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedInvoiceFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-sky-400 hover:bg-sky-50 transition-colors">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-slate-700">Click to upload invoice</span>
                    <span className="text-xs text-slate-500 mt-1">PDF, PNG, JPG up to 10MB</span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={!selectedOrderId}
                  />
                </label>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendInvoice}
              disabled={!selectedCustomerId || !selectedOrderId || !uploadedInvoiceFile}
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