// OrderDetailsView.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
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
  Check,
  Image as ImageIcon,
  Upload,
  Send,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { toast } from "sonner";

interface OrderDetailsViewProps {
  orderId: string;
  onBack: () => void;
}

type SupaOrder = {
  id: number;
  order_name: string | null;
  logo: string | null;
  customer_id: number | null;
  product_id: number | null;
  po_number: string | null;
  order_date: string | null;
  delivery_date: string | null;
  status: string | null;
  delivery_driver: number | null;
  amount: number | null;
  payment_method?: string | null;
  payment_status?: string | null;
  notes?:string | null ;
};

export function OrderDetailsView({ orderId, onBack }: OrderDetailsViewProps) {
  // local state
  const [order, setOrder] = useState<SupaOrder | null>(null);
  const [customer, setCustomer] = useState<any | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // dialogs
  const [openUpdateStatus, setOpenUpdateStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<number | "">("");
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceEmail, setInvoiceEmail] = useState<string>("");

  // pagination for order_items
  const [itemsPage, setItemsPage] = useState(1);
  const itemsPageSize = 5;
  const [itemsTotal, setItemsTotal] = useState(0);

  // pagination for drivers list in dialog
  const [driversPage, setDriversPage] = useState(1);
  const driversPageSize = 6;
  const [driversTotal, setDriversTotal] = useState(0);

  // derived helper for status UI color
  const getStatusColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "in transit":
      case "in-transit":
      case "intransit":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  // fetch single order by order_name first, fallback to id
  async function fetchOrderDetails() {
    setLoading(true);
    try {
      // try by order_name
      let orderRes = await supabase
        .from("orders")
        .select("*")
        .eq("order_name", orderId)
        .limit(1);

      if (!orderRes.data || orderRes.data.length === 0) {
        // fallback: try by numeric id
        const idNum = Number(orderId);
        if (!Number.isNaN(idNum)) {
          orderRes = await supabase.from("orders").select("*").eq("id", idNum).limit(1);
        }
      }

      const found = (orderRes.data && orderRes.data[0]) || null;
      if (!found) {
        toast.error("Order not found");
        setOrder(null);
        setLoading(false);
        return;
      }

      setOrder(found);
      setNewStatus(found.status || "Pending");
      // fetch customer
      if (found.customer_id) {
        const cust = await supabase.from("customers").select("*").eq("id", found.customer_id).single();
        setCustomer(cust.data || null);
        setInvoiceEmail((cust.data && (cust.data.email || "")) || "");
      } else {
        setCustomer(null);
      }

      // fetch status history - if you have a dedicated table you can pull it; else build from audit columns.
      // Attempt to fetch from a table "order_status_history" if it exists; otherwise mock a minimal history.
      const sh = await supabase.from("order_status_history").select("*").eq("order_id", found.id).order("created_at", { ascending: true }).limit(50);
      if (sh.data && sh.data.length > 0) {
        setStatusHistory(sh.data);
      } else {
        // fallback minimal history (order created)
        setStatusHistory([
          { status: "Order Placed", timestamp: found.created_at || found.order_date || new Date().toISOString(), description: "Order created" },
          ...(found.status && found.status !== "Pending" ? [{ status: found.status, timestamp: found.updated_at || new Date().toISOString(), description: `Current status: ${found.status}` }] : [])
        ]);
      }
    } catch (err) {
      console.error("fetchOrderDetails error", err);
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  }

  // fetch paginated order_items
  async function fetchOrderItems(page = 1) {
    if (!order) return;
    const from = (page - 1) * itemsPageSize;
    const to = from + itemsPageSize - 1;
    try {
      const res = await supabase
        .from("order_items")
        .select("*", { count: "exact" })
        .eq("order_id", order.id)
        .range(from, to)
        .order("id", { ascending: true });
      setOrderItems(res.data || []);
      setItemsTotal(res.count || 0);
    } catch (err) {
      console.error("fetchOrderItems error", err);
    }
  }

  // fetch paginated drivers
  async function fetchDrivers(page = 1) {
    const from = (page - 1) * driversPageSize;
    const to = from + driversPageSize - 1;
    try {
      const res = await supabase
        .from("drivers")
        .select("*", { count: "exact" })
        .range(from, to)
        .order("id", { ascending: true });
      setDrivers(res.data || []);
      setDriversTotal(res.count || 0);
    } catch (err) {
      console.error("fetchDrivers error", err);
    }
  }

  // upload invoice file to storage and return public path
  async function uploadInvoiceFile(file: File) {
    try {
      const timestamp = Date.now();
      const path = `invoices/order-${order?.id || "unknown"}/${timestamp}-${file.name}`;
      const res = await supabase.storage.from("invoices").upload(path, file, { upsert: true });
      if (res.error) {
        console.error("storage upload error", res.error);
        toast.error("Invoice upload failed");
        return null;
      }
      // get public url (or signed URL)
      const { data: publicData } = supabase.storage.from("invoices").getPublicUrl(res.data.path);
      const publicUrl = publicData?.publicUrl || null;
      return { path: res.data.path, publicUrl };
    } catch (err) {
      console.error("uploadInvoiceFile error", err);
      toast.error("Invoice upload error");
      return null;
    }
  }

  // send invoice: upload then call Edge Function to email
  async function handleSendInvoice() {
    if (!invoiceFile) {
      toast.error("Select a PDF first");
      return;
    }
    if (!invoiceEmail || !invoiceEmail.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }
    if (!order) {
      toast.error("Order not loaded");
      return;
    }

    try {
      toast("Uploading invoice...", { description: "Please wait..." });
      const uploaded = await uploadInvoiceFile(invoiceFile);
      if (!uploaded) return;
      toast.dismiss();

      // call a Supabase Edge Function named "send_invoice" — implement server side to perform actual email send
      toast("Sending invoice email...", { description: "loading" });
      const fn = await supabase.functions.invoke("send_invoice", {
        body: JSON.stringify({
          order_id: order.id,
          file_path: uploaded.path,
          public_url: uploaded.publicUrl,
          to: invoiceEmail,
        }),
      });

      toast.dismiss();
      if (fn.error) {
        console.error("function error", fn.error);
        toast.error("Failed to trigger email function");
        return;
      }

      toast.success("Invoice sent successfully");
      setIsInvoiceDialogOpen(false);
      setInvoiceFile(null);
    } catch (err) {
      console.error("handleSendInvoice error", err);
      toast.error("Failed to send invoice");
    }
  }

  // update order status in DB
  async function handleStatusUpdate() {
    if (!order) return;
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", order.id);
      if (error) {
        console.error("status update error", error);
        toast.error("Failed to update status");
        return;
      }
      // optionally insert into status history table if exists
      await supabase.from("order_status_history").insert({ order_id: order.id, status: newStatus });
      // refresh
      await fetchOrderDetails();
      setOpenUpdateStatus(false);
      toast.success("Status updated");
    } catch (err) {
      console.error("handleStatusUpdate error", err);
      toast.error("Failed to update status");
    }
  }

  // assign driver (update orders.delivery_driver)
  async function handleDriverAssignment() {
    if (!order || !selectedDriverId) return;
    try {
      const { error } = await supabase.from("orders").update({ delivery_driver: Number(selectedDriverId) }).eq("id", order.id);
      if (error) {
        console.error("assign driver update error", error);
        toast.error("Failed to assign driver");
        return;
      }
      // optional: update drivers table status to 'Assigned'
      await supabase.from("drivers").update({ status: "Assigned" }).eq("id", Number(selectedDriverId));

      // refresh lists
      await fetchOrderDetails();
      await fetchDrivers(driversPage);
      setIsDriverDialogOpen(false);
      setSelectedDriverId("");
      toast.success("Driver assigned");
    } catch (err) {
      console.error("handleDriverAssignment error", err);
      toast.error("Failed to assign driver");
    }
  }

  // file change handler for invoice
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be < 10MB");
      return;
    }
    setInvoiceFile(file);
    toast.success("Invoice file selected");
  };

  // initial fetch
  useEffect(() => {
    fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // fetch order_items when order loaded or page changes
  useEffect(() => {
    if (order) fetchOrderItems(itemsPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, itemsPage]);

  // fetch drivers when dialog open or page changes
  useEffect(() => {
    if (isDriverDialogOpen) fetchDrivers(driversPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDriverDialogOpen, driversPage]);

  // simple helper to format money
  const fmtMoney = (n: number | null | undefined) => `$${((n || 0)).toFixed(2)}`;

  // UI: if loading show skeleton minimal (kept minimal to avoid changing design)
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="h-6 bg-slate-200 rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-40 bg-slate-200 rounded" />
              <div className="h-64 bg-slate-200 rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-slate-200 rounded" />
              <div className="h-32 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-600">Order not found.</div>
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={onBack}>Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h1 className="text-3xl mb-1">Order Details</h1>
            <p className="text-slate-600">{order.order_name || `#${order.id}`}</p>
          </div>
        </div>

        <Badge className={`px-4 py-2 text-sm ${getStatusColor(order.status || "Pending")}`}>
          {order.status || "Pending"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-sky-600" /> Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer && customer.company_logo && (
                <div className="mb-4">
                  <div className="text-sm text-slate-500 mb-2">Company Logo</div>
                  <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-50">
                    <img src={customer.company_logo} alt={`${customer.company_name} logo`} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Company Name</div>
                  <div className="font-medium">{customer?.company_name || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Contact Person</div>
                  <div className="font-medium">{(customer?.first_name || "") + (customer?.last_name ? ` ${customer?.last_name}` : "") || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</div>
                  <div className="font-medium text-sky-600">{customer?.email || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</div>
                  <div className="font-medium">{customer?.phone || "-"}</div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-slate-500 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Delivery Address</div>
                <div className="font-medium">{customer?.delivery_address || "-"}</div>
                {customer?.delivery_zone && <div className="text-sm text-slate-500 mt-1">Zone: {customer.delivery_zone}</div>}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-sky-600" /> Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.product_name || `Product ${item.product_id || item.id}`}</div>
                      <div className="text-sm text-slate-500">SKU: {item.sku || item.product_id || "-"}</div>
                      <div className="text-sm text-slate-600 mt-1">Quantity: {item.quantity} × ${Number(item.unit_price || 0).toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">${Number(item.subtotal || (item.quantity * (item.unit_price || 0))).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-600">Showing {(itemsPage - 1) * itemsPageSize + 1}-{Math.min(itemsPage * itemsPageSize, itemsTotal)} of {itemsTotal}</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setItemsPage((p) => Math.max(1, p - 1))} disabled={itemsPage === 1}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setItemsPage((p) => (p * itemsPageSize < itemsTotal ? p + 1 : p))} disabled={itemsPage * itemsPageSize >= itemsTotal}>Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5 text-sky-600" /> Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Delivery Date</div>
                  <div className="font-medium">{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Order Date</div>
                  {/* <div className="font-medium">{order.order_date ? new Date(order.order_date).toLocaleString() : (order.created_at ? new Date(order.created_at).toLocaleString() : "-")}</div> */}
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Driver</div>
                  <div className="font-medium">{order.delivery_driver ? (() => {
                    const drv = drivers.find(d => d.id === order.delivery_driver);
                    return drv ? drv.driver_name : `Driver #${order.delivery_driver}`;
                  })() : "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Tracking Number</div>
                  <div className="font-medium">—</div>
                </div>
              </div>
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

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-sky-600" /> Order Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-slate-500 mb-1">Order Date</div>
                {/* <div className="font-medium">{order.order_date ? new Date(order.order_date).toLocaleString() : (order.created_at ? new Date(order.created_at).toLocaleString() : "-")}</div> */}
              </div>
              <Separator />
              <div>
                <div className="text-sm text-slate-500 mb-1">Delivery Date</div>
                <div className="font-medium">{order.delivery_date ? new Date(order.delivery_date).toLocaleString() : "-"}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-sky-600" /> Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-slate-500 mb-1">Payment Status</div>
                <Badge className={order.payment_status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>{order.payment_status || "Pending"}</Badge>
              </div>
              <Separator />
              <div>
                <div className="text-sm text-slate-500 mb-1">Amount</div>
                <div className="font-medium">{fmtMoney(order.amount)}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-sky-600" /> Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusHistory.map((h, idx) => (
                  <div key={idx} className="relative pl-6">
                    {idx !== statusHistory.length - 1 && <div className="absolute left-2 top-6 bottom-0 w-px bg-slate-200" />}
                    <div className="absolute left-0 top-1"><CheckCircle className="w-4 h-4 text-green-600" /></div>
                    <div>
                      <div className="font-medium text-sm">{h.status}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{h.timestamp || h.created_at}</div>
                      <div className="text-xs text-slate-600 mt-1">{h.description || ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" onClick={() => { setIsDriverDialogOpen(true); }}>
                <UserPlus className="w-4 h-4 mr-2" /> Assign/Reassign Driver
              </Button>

              <Button className="w-full gradient-primary text-white hover:opacity-90" onClick={() => setIsInvoiceDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" /> Upload and Send Invoice
              </Button>

              <Button className="w-full" variant="outline" onClick={() => {
                // plain email: open mailto as fallback
                if (customer?.email) window.location.href = `mailto:${customer.email}`;
              }}>
                <Mail className="w-4 h-4 mr-2" /> Email Customer
              </Button>

              <Button className="w-full" variant="secondary" onClick={() => setOpenUpdateStatus(true)}>
                <Package className="w-4 h-4 mr-2" /> Update Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={openUpdateStatus} onOpenChange={setOpenUpdateStatus}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Label htmlFor="status">Status</Label>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v)}>
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
            <Button type="button" variant="outline" onClick={() => setOpenUpdateStatus(false)}>Cancel</Button>
            <Button type="button" onClick={handleStatusUpdate}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Driver Dialog */}
      <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Driver to Order</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="grid gap-2">
              <Label>Available Drivers</Label>
              <div className="space-y-2">
                {drivers.length === 0 && <div className="p-4 text-center text-slate-500">No drivers</div>}
                {drivers.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => setSelectedDriverId(driver.id)}
                    disabled={driver.status === "En Route" || driver.status === "Assigned"}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${driver.status === "En Route" || driver.status === "Assigned" ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed" : selectedDriverId === driver.id ? "border-sky-500 bg-sky-50 cursor-pointer" : "border-slate-200 hover:border-slate-300 bg-white cursor-pointer"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{driver.driver_name}</span>
                          <Badge className={`text-xs ${driver.status === "Available" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}`}>{driver.status}</Badge>
                        </div>
                        <div className="text-sm text-slate-600">{driver.phone_number}</div>
                      </div>
                      {selectedDriverId === driver.id && driver.status === "Available" && <Check className="w-5 h-5 text-sky-600" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm text-slate-600">Showing page {driversPage} of {Math.ceil((driversTotal || 0) / driversPageSize) || 1}</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setDriversPage((p) => Math.max(1, p - 1))} disabled={driversPage === 1}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setDriversPage((p) => (p * driversPageSize < (driversTotal || 0) ? p + 1 : p))} disabled={driversPage * driversPageSize >= (driversTotal || 0)}>Next</Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setIsDriverDialogOpen(false); setSelectedDriverId(""); }}>Cancel</Button>
            <Button type="button" onClick={handleDriverAssignment} disabled={!selectedDriverId}>Assign Driver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-sky-600" /> Upload and Send Invoice</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm text-blue-900">{customer?.company_name || "Customer"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-email" className="flex items-center gap-2"><Mail className="w-4 h-4 text-sky-600" /> Send Invoice To</Label>
              <Input id="invoice-email" type="email" placeholder="customer@example.com" value={invoiceEmail} onChange={(e) => setInvoiceEmail(e.target.value)} className="w-full" />
              <p className="text-xs text-slate-500">Default: {customer?.email || "—"}</p>
            </div>

            <div className="space-y-2">
              <Label>Invoice File (PDF only, max 10MB)</Label>
              {!invoiceFile ? (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-600"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-500">PDF files only (MAX. 10MB)</p>
                  </div>
                  <input type="file" className="hidden" accept=".pdf,application/pdf" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg"><FileText className="w-5 h-5 text-green-600" /></div>
                    <div>
                      <p className="font-medium text-sm text-green-900">{invoiceFile.name}</p>
                      <p className="text-xs text-green-600">{(invoiceFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setInvoiceFile(null)} className="hover:bg-red-100 hover:text-red-600"><X className="w-4 h-4" /></Button>
                </div>
              )}
            </div>

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
            <Button type="button" variant="outline" onClick={() => { setIsInvoiceDialogOpen(false); setInvoiceFile(null); setInvoiceEmail(customer?.email || ""); }}>Cancel</Button>
            <Button type="button" className="gradient-primary text-white" onClick={handleSendInvoice} disabled={!invoiceFile}><Send className="w-4 h-4 mr-2" /> Send Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
