'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Eye, Filter, Check, ChevronsUpDown, UserPlus, Image as ImageIcon, Upload, X } from 'lucide-react';
import { OrderDetailsView } from './OrderDetailsView';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';

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
    amount: number | null;
    driver_id: number | null;
    payment_method?: string | null;
    payment_status?: string | null;
};

export function OrderManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    // modal & UI state
    const [isPlaceOrderDialogOpen, setIsPlaceOrderDialogOpen] = useState(false);
    const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
    const [isAssignDriverDialogOpen, setIsAssignDriverDialogOpen] = useState(false);
    const [selectedOrderForDriver, setSelectedOrderForDriver] = useState<string | null>(null);
    const [selectedDriverForAssignment, setSelectedDriverForAssignment] = useState('');
    const [customerLogoPreview, setCustomerLogoPreview] = useState<string | null>(null);
    const [loadingPlaceOrder, setLoadingPlaceOrder] = useState(false);
    const [loadingAssign, setLoadingAssign] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // data from Supabase
    const [orders, setOrders] = useState<SupaOrder[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    // new order form (keeps same fields you had)
    const [newOrder, setNewOrder] = useState({
        customerId: '',
        productType: '', // "Unit" or "Case" per your UI
        quantity: '',
        deliveryDate: '',
        deliveryAddress: '',
        driverId: '',
        paymentStatus: '',
        deliveryStatus: '',
        poNumber: '',
        specialInstructions: '',
        customerLogo: '',
        paymentMethod: '',
    });



    // --- helper derived UI functions (colors, mapping) ---
    const orderStatusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        Confirmed: 'bg-blue-100 text-blue-800',
        Processing: 'bg-cyan-100 text-cyan-800',
        Ready: 'bg-purple-100 text-purple-800',
        Completed: 'bg-green-100 text-green-800',
        Cancelled: 'bg-red-100 text-red-800',
    };

    const deliveryStatusColors: Record<string, string> = {
        'Not Dispatched': 'bg-slate-100 text-slate-800',
        Dispatched: 'bg-blue-100 text-blue-800',
        'In Transit': 'bg-indigo-100 text-indigo-800',
        'Out for Delivery': 'bg-purple-100 text-purple-800',
        Delivered: 'bg-green-100 text-green-800',
        Failed: 'bg-red-100 text-red-800',
    };

    const getDriverStatusColor = (status: string) => {
        switch (status) {
            case 'Available':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Assigned':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'En Route':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    // --- fetch data from Supabase ---
    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchAll() {
        // fetch customers, products, drivers and orders
        try {
            const [{ data: custData }, { data: prodData }, { data: drivData }, { data: ordersData }] =
                await Promise.all([
                    supabase.from('customers').select('*'),
                    supabase.from('products').select('*'),
                    supabase.from('drivers').select('*'),
                    supabase.from('orders').select('*').order('created_at', { ascending: false }),
                ]);

            setCustomers(custData || []);
            setProducts(prodData || []);
            setDrivers(drivData || []);
            setOrders((ordersData as SupaOrder[]) || []);
        } catch (err) {
            console.error('fetchAll error', err);
        }
    }

    // --- helper: derive display rows (enrich orders) ---
    const enrichedOrders = orders.map((o) => {
        const cust = customers.find((c) => c.id === o.customer_id);
        const prod = products.find((p) => p.id === o.product_id);
        const drv = drivers.find((d) => d.id === o.driver_id);

        // derive deliveryStatus for UI (no schema column named delivery_status)
        let deliveryStatus = 'Not Dispatched';
        if (o.driver_id) {
            if (o.status === 'Completed') deliveryStatus = 'Delivered';
            else deliveryStatus = 'In Transit';
        }

        return {
            ...o,
            customerCompany: cust?.company_name || '-',
            contactName: `${cust?.first_name || ''}${cust?.last_name ? ' ' + cust?.last_name : ''}`.trim() || '-',
            productTypeDisplay: prod ? `${prod.product_name} (${prod.product_type})` : (o.product_id ? 'Product' : '-'),
            driverName: drv ? drv.driver_name : null,
            deliveryStatus,
        };
    });


    const totalPages = Math.ceil(enrichedOrders.length / itemsPerPage);

    const paginatedOrders = enrichedOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // --- file upload helper (logo) ---
    async function uploadLogoFile(file: File) {
        try {
            const path = `order-logos/${Date.now()}-${file.name}`;
            const res = await supabase.storage.from('logos').upload(path, file);
            if (res.error) {
                console.error('logo upload error', res.error);
                return null;
            }
            const publicUrl = supabase.storage.from('logos').getPublicUrl(res.data.path).data?.publicUrl || null;
            return publicUrl;
        } catch (err) {
            console.error('uploadLogoFile error', err);
            return null;
        }
    }

    // --- place order (insert into orders and order_items) ---
    async function handlePlaceOrder() {
        setLoadingPlaceOrder(true);

        try {
            // upload logo if base64 preview exists as file input earlier
            let logoUrl = null;
            if (newOrder.customerLogo && typeof newOrder.customerLogo !== 'string') {
                // if it's a File object (but in our UI it's base64 preview), we handle file upload via input change
            }

            // if customerLogoPreview contains a data URL (base64), we can convert it to blob and upload
            if (customerLogoPreview && customerLogoPreview.startsWith('data:')) {
                const res = await fetch(customerLogoPreview);
                const blob = await res.blob();
                const file = new File([blob], `logo-${Date.now()}.png`, { type: blob.type });
                logoUrl = await uploadLogoFile(file);
            }

            // find product based on selected productType: pick first product with product_type === productType
            const chosenProduct =
                products.find((p) => p.product_type?.toLowerCase() === String(newOrder.productType).toLowerCase()) ||
                products[0] ||
                null;

            // compute amount simply: quantity * price_per_unit or price_per_case fallback
            const qty = Number(newOrder.quantity) || 0;
            let amount = 0;
            if (chosenProduct) {
                const perUnit = chosenProduct.price_per_unit ?? chosenProduct.price_per_case ?? 0;
                amount = qty * Number(perUnit);
            }

            // generate an order_name like ORD-<timestamp>
            const orderName = `ORD-${Date.now().toString().slice(-6)}`;

            // prepare order payload
            const orderPayload: any = {
                order_name: orderName,
                logo: logoUrl,
                customer_id: newOrder.customerId || null,
                product_id: chosenProduct ? chosenProduct.id : null,
                po_number: newOrder.poNumber || null,
                order_date: new Date().toISOString(),
                delivery_date: newOrder.deliveryDate || null,
                status: 'Pending',
                driver_id: newOrder.driverId ? Number(newOrder.driverId) : null,
                // delivery_driver: newOrder.driverId ? Number(newOrder.driverId) : null,
                amount: amount || 0,
                payment_method: newOrder.paymentMethod || null,
                payment_status: newOrder.paymentStatus || null,
                payment_date: newOrder.paymentStatus ? new Date().toISOString() : null,
            };

            // insert order
            const { data: insertedOrders, error: insertErr } = await supabase.from('orders').insert(orderPayload).select().limit(1);
            if (insertErr) {
                console.error('orders insert error', insertErr);
                setLoadingPlaceOrder(false);
                return;
            }

            const insertedOrder = insertedOrders?.[0];
            if (!insertedOrder) {
                setLoadingPlaceOrder(false);
                return;
            }

            // insert order_items: map to product_id and quantity
            if (chosenProduct) {
                const itemPayload = {
                    order_id: insertedOrder.id,
                    product_id: chosenProduct.id,
                    quantity: qty || 1,
                };
                const { error: oiErr } = await supabase.from('order_items').insert(itemPayload);
                if (oiErr) console.error('order_items insert error', oiErr);
            }

            // refresh quick: prepend new order into UI (no full refetch required)
            setOrders((prev) => [insertedOrder as SupaOrder, ...prev]);

            // reset form + close modal
            setNewOrder({
                customerId: '',
                productType: '',
                quantity: '',
                deliveryDate: '',
                deliveryAddress: '',
                driverId: '',
                paymentStatus: '',
                deliveryStatus: '',
                poNumber: '',
                specialInstructions: '',
                customerLogo: '',
                paymentMethod: '',
            });
            setCustomerLogoPreview(null);
            setIsPlaceOrderDialogOpen(false);
        } catch (err) {
            console.error('handlePlaceOrder error', err);
        } finally {
            setLoadingPlaceOrder(false);
        }
    }

    // --- assign driver to an existing order (update orders.delivery_driver) ---
    async function handleAssignDriver() {
        if (!selectedDriverForAssignment || !selectedOrderForDriver) return;
        setLoadingAssign(true);
        try {
            // update DB
            const orderId = selectedOrderForDriver;
            const { error: updErr } = await supabase.from('orders').update({ driver_id: Number(selectedDriverForAssignment) }).eq('order_name', orderId);
            if (updErr) {
                console.error('assign driver update error', updErr);
                setLoadingAssign(false);
                return;
            }

            // update UI (quick)
            setOrders((prev) =>
                prev.map((o) =>
                    String(o.order_name) === orderId ? { ...o, driver_id: Number(selectedDriverForAssignment) } : o
                )
            );

            setIsAssignDriverDialogOpen(false);
            setSelectedOrderForDriver(null);
            setSelectedDriverForAssignment('');
        } catch (err) {
            console.error('handleAssignDriver error', err);
        } finally {
            setLoadingAssign(false);
        }
    }

    // --- file input handler for place order modal ---
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setCustomerLogoPreview(result);
            setNewOrder((n) => ({ ...n, customerLogo: result }));
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        setCustomerLogoPreview(null);
        setNewOrder((n) => ({ ...n, customerLogo: '' }));
    };

    // open assign dialog helper
    const openAssignDriverDialog = (orderName: string) => {
        setSelectedOrderForDriver(orderName);
        setSelectedDriverForAssignment('');
        setIsAssignDriverDialogOpen(true);
    };

    // pick displayed lists for command popover (customers)
    const customerListForUI = customers.map((c) => ({ id: c.id, label: `${c.company_name} — ${c.first_name || ''} ${c.last_name || ''}` }));

    // ---------- UI render (keeps exactly your original layout) ----------
    if (selectedOrderId) {
        return <OrderDetailsView orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl mb-2">Order Management</h1>
            </div>

            {/* Actions Bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="flex-1 max-w-md relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-slate-500" />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Orders</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="ready">Ready</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={() => setIsPlaceOrderDialogOpen(true)}>Place Order for Customer</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Orders ({enrichedOrders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Logo</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>PO Number</TableHead>
                                <TableHead>Order Date</TableHead>
                                <TableHead>Delivery Date</TableHead>
                                <TableHead>Order Status</TableHead>
                                <TableHead>Delivery Status</TableHead>
                                <TableHead>Driver</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={12} className="text-center p-6 text-slate-500">No orders found.</TableCell>
                                </TableRow>
                            ) : (
                                paginatedOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-sm">{order.order_name || `#${order.id}`}</TableCell>
                                        <TableCell>
                                            {order.logo ? (
                                                <div className="w-12 h-12 rounded-md overflow-hidden border border-slate-200">
                                                    <img src={order.logo} alt={`${order.customerCompany} logo`} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200">
                                                    <ImageIcon className="w-5 h-5 text-slate-400" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="text-sm">{order.customerCompany}</div>
                                                <div className="text-xs text-slate-500">{order.contactName}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell><div className="text-sm">{order.productTypeDisplay || '-'}</div></TableCell>
                                        <TableCell className="text-sm">{order.po_number || '-'}</TableCell>
                                        <TableCell className="text-sm">{order.order_date ? new Date(order.order_date).toLocaleString() : '-'}</TableCell>
                                        <TableCell className="text-sm">{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : '-'}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${orderStatusColors[order.payment_status || 'Pending']}`}>
                                                {order.payment_status || 'Pending'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${deliveryStatusColors[order.deliveryStatus] || 'bg-slate-100 text-slate-800'}`}>
                                                {order.deliveryStatus || 'Not Dispatched'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm">{order.driverName || '-'}</TableCell>
                                        <TableCell className="text-sm">${(order.amount ?? 0).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedOrderId(String(order.order_name || order.id))}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                {!order.driverName && (order.status === 'Pending' || order.status === 'Processing' || order.status === 'Ready') && (
                                                    <Button variant="ghost" size="sm" onClick={() => openAssignDriverDialog(String(order.order_name || order.id))} className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50">
                                                        <UserPlus className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {/* Pagination Controls */}
                    {enrichedOrders.length > 0 && (
                        <div className="flex justify-between items-center px-6 py-4 border-t">
                            <p className="text-sm text-gray-600">
                                Showing {(currentPage - 1) * itemsPerPage + 1}–
                                {Math.min(currentPage * itemsPerPage, enrichedOrders.length)} of {enrichedOrders.length}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1.5 rounded-md border text-sm ${currentPage === 1
                                            ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                                            : 'text-gray-700 bg-white hover:bg-gray-100'
                                        }`}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => (p * itemsPerPage < enrichedOrders.length ? p + 1 : p))}
                                    disabled={currentPage * itemsPerPage >= enrichedOrders.length}
                                    className={`px-3 py-1.5 rounded-md border text-sm ${currentPage * itemsPerPage >= enrichedOrders.length
                                            ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                                            : 'text-gray-700 bg-white hover:bg-gray-100'
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}


                </CardContent>
            </Card>

            {/* Place Order Dialog (keeps same UI fields) */}
            <Dialog open={isPlaceOrderDialogOpen} onOpenChange={setIsPlaceOrderDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Place New Order</DialogTitle>
                        <DialogDescription>Enter the details for the new order.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="col-span-2 grid gap-2">
                            <Label htmlFor="customer">Customer</Label>
                            <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={customerSearchOpen} className="justify-between">
                                        {newOrder.customerId ? (customers.find((c) => c.id === Number(newOrder.customerId))?.company_name ?? 'Selected customer') : 'Select customer...'}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search customer..." />
                                        <CommandList>
                                            <CommandEmpty>No customer found.</CommandEmpty>
                                            <CommandGroup>
                                                {customers.map((customer) => (
                                                    <CommandItem
                                                        key={customer.id}
                                                        value={customer.company_name}
                                                        onSelect={() => {
                                                            setNewOrder((n) => ({ ...n, customerId: String(customer.id) }));
                                                            setCustomerSearchOpen(false);
                                                        }}
                                                    >
                                                        <div>
                                                            <div>{customer.company_name}</div>
                                                            <div className="text-xs text-slate-500">{customer.first_name} {customer.last_name}</div>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="productType">Product Type</Label>
                            <Select value={newOrder.productType} onValueChange={(value) => setNewOrder((n) => ({ ...n, productType: value }))}>
                                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Unit">Unit</SelectItem>
                                    <SelectItem value="Case">Case</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input id="quantity" type="number" value={newOrder.quantity} onChange={(e) => setNewOrder((n) => ({ ...n, quantity: e.target.value }))} placeholder="Enter quantity" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="deliveryDate">Delivery Date</Label>
                            <Input id="deliveryDate" type="date" value={newOrder.deliveryDate} onChange={(e) => setNewOrder((n) => ({ ...n, deliveryDate: e.target.value }))} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="driverId">Assign Driver</Label>
                            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a driver" />
                                </SelectTrigger>
                                <SelectContent>
                                    {drivers.length > 0 ? (
                                        drivers.map((driver) => (
                                            <SelectItem key={driver.id} value={String(driver.id)}>
                                                {driver.driver_name} — {driver.zone}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem disabled value="no-drivers">
                                            No drivers available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>

                        </div>

                        <div className="col-span-2 grid gap-2">
                            <Label htmlFor="deliveryAddress">Delivery Address</Label>
                            <Textarea id="deliveryAddress" value={newOrder.deliveryAddress} onChange={(e) => setNewOrder((n) => ({ ...n, deliveryAddress: e.target.value }))} placeholder="Enter delivery address" rows={2} />
                        </div>

                        <div className="col-span-2 grid gap-2">
                            <Label htmlFor="customerLogo">Customer Company Logo (Optional)</Label>
                            {customerLogoPreview ? (
                                <div className="relative inline-block">
                                    <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-50">
                                        <img src={customerLogoPreview} alt="Customer logo preview" className="w-full h-full object-cover" />
                                    </div>
                                    <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={handleRemoveLogo}>
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer">
                                        <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-sky-400 hover:bg-sky-50 transition-colors">
                                            <Upload className="w-4 h-4 text-slate-500" />
                                            <span className="text-sm text-slate-600">Upload Logo</span>
                                        </div>
                                        <input type="file" id="customerLogo" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                    </label>
                                    <span className="text-xs text-slate-500">PNG, JPG up to 5MB</span>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="paymentStatus">Payment Status</Label>
                            <Select value={newOrder.paymentStatus} onValueChange={(value) => setNewOrder((n) => ({ ...n, paymentStatus: value }))}>
                                <SelectTrigger><SelectValue placeholder="Select payment status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="partially-paid">Partially Paid</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="deliveryStatus">Delivery Status</Label>
                            <Select value={newOrder.deliveryStatus} onValueChange={(value) => setNewOrder((n) => ({ ...n, deliveryStatus: value }))}>
                                <SelectTrigger><SelectValue placeholder="Select delivery status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Not Dispatched">Not Dispatched</SelectItem>
                                    <SelectItem value="Processing">Processing</SelectItem>
                                    <SelectItem value="In Transit">In Transit</SelectItem>
                                    <SelectItem value="Delivered">Delivered</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="poNumber">PO Number (Optional)</Label>
                            <Input id="poNumber" value={newOrder.poNumber} onChange={(e) => setNewOrder((n) => ({ ...n, poNumber: e.target.value }))} placeholder="Enter PO number" />
                        </div>

                        <div className="col-span-2 grid gap-2">
                            <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                            <Textarea id="specialInstructions" value={newOrder.specialInstructions} onChange={(e) => setNewOrder((n) => ({ ...n, specialInstructions: e.target.value }))} placeholder="Add any special instructions..." rows={3} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsPlaceOrderDialogOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={handlePlaceOrder} disabled={loadingPlaceOrder}>
                            {loadingPlaceOrder ? 'Placing...' : 'Place Order'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign Driver Dialog */}
            <Dialog open={isAssignDriverDialogOpen} onOpenChange={setIsAssignDriverDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Assign Driver to Order</DialogTitle>
                        <DialogDescription>Select an available driver to assign to {selectedOrderForDriver}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="grid gap-2">
                            <Label>Available Drivers</Label>
                            <div className="space-y-2">
                                {drivers.map((driver) => (
                                    <button
                                        key={driver.id}
                                        onClick={() => setSelectedDriverForAssignment(String(driver.id))}
                                        disabled={driver.status === 'En Route' || driver.status === 'Assigned'}
                                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${driver.status === 'En Route' || driver.status === 'Assigned'
                                                ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                                                : selectedDriverForAssignment === String(driver.id)
                                                    ? 'border-sky-500 bg-sky-50 cursor-pointer'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium">{driver.driver_name}</span>
                                                    <Badge className={`text-xs ${getDriverStatusColor(driver.status)}`}>{driver.status}</Badge>
                                                </div>
                                                <div className="text-sm text-slate-600">{driver.phone_number}</div>
                                            </div>
                                            {selectedDriverForAssignment === String(driver.id) && driver.status === 'Available' && <Check className="w-5 h-5 text-sky-600" />}
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
                        <Button type="button" variant="outline" onClick={() => setIsAssignDriverDialogOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={handleAssignDriver} disabled={!selectedDriverForAssignment || loadingAssign}>
                            {loadingAssign ? 'Assigning...' : 'Assign Driver'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
