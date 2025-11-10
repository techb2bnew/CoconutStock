'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Plus, Edit, Trash2, Eye, DollarSign } from 'lucide-react'

interface Customer {
  id: string
  company_name: string
  first_name: string
  last_name: string
  email: string
  phone: string
  delivery_address: string
  company_logo?: string
  custom_price_per_unit?: number
  custom_price_per_case?: number
  delivery_zone?: string | number
  industry?: string
  status?: string
  total_orders?: number
  last_order?: string
  registration_date?: string
}

interface Driver {
  id: string
  zone: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [driverMap, setDriverMap] = useState<Map<string, string>>(new Map())
  const [open, setOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null)
  const [pricingCustomer, setPricingCustomer] = useState<Customer | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pricingModalOpen, setPricingModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [zoneModalOpen, setZoneModalOpen] = useState(false)
  const [newZone, setNewZone] = useState('')
  const [newFee, setNewFee] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [customPricing, setCustomPricing] = useState({
    enabled: false,
    case: '',
    unit: '',
  })

  const [form, setForm] = useState<any>({
    company: '', firstName: '', lastName: '', email: '',
    phone: '', address: '', industry: '', deliveryZone: '',
    customPriceUnit: '', companyLogo: '', customPriceCase: '',
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentCustomers = customers.slice(indexOfFirstItem, indexOfLastItem)

  const updateForm = (key: string, value: any) => {
    setForm((p: any) => ({ ...p, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: customersData, error: custErr } = await supabase.from('customers').select('*')
    if (custErr) return console.error('Customer fetch error:', custErr)

    const { data: driverData, error: driverErr } = await supabase.from('drivers').select('id, zone')
    if (driverErr) console.error('Driver fetch error:', driverErr)

    const newDriverMap = new Map<string, string>()
    driverData?.forEach((d) => newDriverMap.set(String(d.id), d.zone || '—'))
    setDrivers(driverData || [])
    setDriverMap(newDriverMap)

    const customersWithOrders = await Promise.all(
      (customersData || []).map(async (cust) => {
        const { data: orders } = await supabase
          .from('orders')
          .select('id, order_date')
          .eq('customer_id', cust.id)
          .order('order_date', { ascending: false })

        const zoneName = newDriverMap.get(String(cust.delivery_zone)) || '—'

        return {
          ...cust,
          delivery_zone: zoneName,
          total_orders: orders?.length || 0,
          last_order: orders?.[0]?.order_date || '—',
        }
      })
    )

    setCustomers(customersWithOrders)
  }

  const resetForm = () => {
    setForm({
      company: '', firstName: '', lastName: '', email: '',
      phone: '', address: '', industry: '', deliveryZone: '',
      customPriceUnit: '', companyLogo: '', customPriceCase: '',
    })
    setEditCustomer(null)
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!form.company.trim()) newErrors.company = 'Company name is required'
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Invalid email format'
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!form.address.trim()) newErrors.address = 'Address is required'
    if (!form.deliveryZone) newErrors.deliveryZone = 'Delivery zone is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    const data = {
      company_name: form.company,
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone,
      delivery_address: form.address,
      industry: form.industry,
      delivery_zone: form.deliveryZone,
      custom_price_per_unit: form.customPriceUnit || null,
      custom_price_per_case: form.customPriceCase || null,
      company_logo: form.companyLogo || null,
      status: 'active',
    }

    let error
    if (editCustomer) {
      const { error: updateError } = await supabase.from('customers').update(data).eq('id', editCustomer.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase.from('customers').insert(data)
      error = insertError
    }

    if (!error) {
  // Update local state without changing order
  setCustomers((prev) =>
    prev.map((c) =>
      c.id === editCustomer?.id
        ? { ...c, ...data } // update only this record
        : c
    )
  )

  setOpen(false)
  resetForm()
} else {
  console.error(error)
}

  }

  const handleEdit = (cust: Customer) => {
    setEditCustomer(cust)
    setForm({
      company: cust.company_name,
      firstName: cust.first_name,
      lastName: cust.last_name,
      email: cust.email,
      phone: cust.phone,
      address: cust.delivery_address,
      industry: cust.industry,
      deliveryZone: cust.delivery_zone,
      customPriceUnit: cust.custom_price_per_unit || '',
      customPriceCase: cust.custom_price_per_case || '',
      companyLogo: cust.company_logo || ''
    })
    setOpen(true)
  }

  const handleView = async (cust: Customer) => {
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_date')
      .eq('customer_id', cust.id)
      .order('order_date', { ascending: false })

    const updatedCustomer = {
      ...cust,
      total_orders: orders?.length || 0,
      last_order: orders?.[0]?.order_date || '—',
    }

    setViewCustomer(updatedCustomer)
    setViewModalOpen(true)
  }

  const handleViewPricing = (cust: Customer) => {
    setPricingCustomer(cust)
    setCustomPricing({
      enabled: true,
      case: cust.custom_price_per_case ? String(cust.custom_price_per_case) : '',
      unit: cust.custom_price_per_unit ? String(cust.custom_price_per_unit) : '',
    })
    setPricingModalOpen(true)
  }

  const handleSavePricing = async () => {
    if (!pricingCustomer) return

    const data = customPricing.enabled
      ? {
        custom_price_per_case: customPricing.case || null,
        custom_price_per_unit: customPricing.unit || null,
      }
      : {
        custom_price_per_case: null,
        custom_price_per_unit: null,
      }

    const { error } = await supabase
      .from('customers')
      .update(data)
      .eq('id', pricingCustomer.id)

    if (error) {
      console.error('Pricing update error:', error)
    } else {
      setPricingModalOpen(false)
      fetchData()
    }
  }


  const handleSaveZone = async () => {
    if (!newZone || !newFee) {
      alert('Please fill in all fields.')
      return
    }

    console.log('Saving zone:', newZone, newFee)

    setTimeout(() => {
      setZoneModalOpen(false)
      setNewZone('')
      setNewFee('')
    }, 600)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-800">Customer Management</h1>
        <p className="text-sm text-slate-500">CoconutStock HQ - Primary Store</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-1/3">
          <Input placeholder="🔍 Search customers..." className="rounded-lg bg-white border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-200" />
        </div>

        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="rounded-lg bg-[#00a1ff] hover:bg-[#0090e6] text-white text-base font-semibold">
              <Plus className="mr-2 h-4 w-4" /> {editCustomer ? 'Edit Customer' : 'Add New Customer'}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl rounded-xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {editCustomer ? 'Edit Customer' : 'Add New Customer'}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                {editCustomer
                  ? 'Update the selected customer details.'
                  : 'Enter the customer information to add them to the system.'}
              </DialogDescription>
            </DialogHeader>

            {/* Form */}
            <div className="mt-4 space-y-4">
              {/* Pair 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Company Name <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="Enter company name"
                    className="mt-1 h-10 bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[#00a1ff]"
                    value={form.company}
                    onChange={(e) => updateForm('company', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Contact First Name <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="Enter first name"
                    className="mt-1 h-10 bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[#00a1ff]"
                    value={form.firstName}
                    onChange={(e) => updateForm('firstName', e.target.value)}
                  />
                </div>
              </div>

              {/* Pair 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Contact Last Name</Label>
                  <Input
                    placeholder="Enter last name"
                    className="mt-1 h-10 bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[#00a1ff]"
                    value={form.lastName}
                    onChange={(e) => updateForm('lastName', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Email <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="email@example.com"
                    className="mt-1 h-10 bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[#00a1ff]"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                  />
                </div>
              </div>

              {/* Pair 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="+1 (305) 555-0100"
                    className="mt-1 h-10 bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[#00a1ff]"
                    value={form.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Zone</Label>
                  <Input
                    placeholder="Auto-detected or manual"
                    className="mt-1 h-10 bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[#00a1ff]"
                    value={form.zone}
                    onChange={(e) => updateForm('zone', e.target.value)}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label>Delivery Address <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Enter full address"
                  className="mt-1 h-10 bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[#00a1ff]"
                  value={form.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                />
              </div>

              {/* Upload Logo */}
              {/* <div>
              <Label>Company Logo (Optional)</Label>
              <div className="flex items-center gap-3 mt-2">
                <label className="flex items-center justify-center w-32 h-10 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 text-sm text-gray-700">
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={(e) => updateForm('logo', e.target.files?.[0])}
                    className="hidden"
                  />
                  Upload Logo
                </label>
                <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
              </div>
            </div> */}

              {/* Custom Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Custom Price per Case</Label>
                  <Input
                    type="number"
                    placeholder="75.00"
                    className="mt-1 h-10 bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[#00a1ff]"
                    value={form.customPriceCase}
                    onChange={(e) => updateForm('customPriceCase', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Custom Price per Unit</Label>
                  <Input
                    type="number"
                    placeholder="4.50"
                    className="mt-1 h-10 bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[#00a1ff]"
                    value={form.customPriceUnit}
                    onChange={(e) => updateForm('customPriceUnit', e.target.value)}
                  />
                </div>
              </div>

              {/* Delivery Zone */}
              <div>
                <Label className="flex justify-between text-gray-700 text-sm">
                  Delivery Zone
                  <button
                    type="button"
                    onClick={() => setZoneModalOpen(true)}
                    className="text-[#00a1ff] text-sm font-medium hover:underline"
                  >
                    + Add New Zone
                  </button>
                </Label>

                <Select onValueChange={(v) => updateForm('deliveryZone', v)} value={String(form.deliveryZone)} >
                  <SelectTrigger className="mt-1 h-10 bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[#00a1ff]">
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Industry */}
              <div>
                <Label>Industry</Label>
                <Input
                  placeholder="Hotel, Restaurant, Event Planner"
                  className="mt-1 h-10 bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[#00a1ff]"
                  value={form.industry}
                  onChange={(e) => updateForm('industry', e.target.value)}
                />
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="mt-6 flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSave} className="rounded-lg bg-[#00a1ff] hover:bg-[#0090e6] text-white text-base font-semibold px-6">
                {editCustomer ? 'Update' : 'Save Customer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 🧩 SMALL ADD ZONE MODAL */}
        <Dialog open={zoneModalOpen} onOpenChange={setZoneModalOpen}>
          <DialogContent className="max-w-sm rounded-xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Add New Delivery Zone
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Create a new delivery zone with a custom delivery fee.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-3">
              <div>
                <Label>Zone Name</Label>
                <Select onValueChange={(v) => setNewZone(v)} value={newZone}>
                  <SelectTrigger className="mt-1 h-10 bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[#00a1ff]">
                    <SelectValue placeholder="Select or enter zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((d) => (
                      <SelectItem key={d.id} value={d.zone}>
                        {d.zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Delivery Fee</Label>
                <Input
                  type="number"
                  placeholder="Enter fee (e.g. 20.00)"
                  className="mt-1 h-10 bg-gray-50 border-gray-300 focus:ring-2 focus:ring-[#00a1ff]"
                  value={newFee}
                  onChange={(e) => setNewFee(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="mt-6 flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleSaveZone}
                className="rounded-lg bg-[#00a1ff] hover:bg-[#0090e6] text-white font-semibold px-6"
              >
                Save Zone
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>

      {/* Table */}

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-700 font-semibold">
            <tr>
              <th className="p-3">Company</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Zone</th>
              <th className="p-3">Total Orders</th>
              <th className="p-3">Last Order</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCustomers.map((cust) => (
              <tr key={cust.id} className="border-b hover:bg-slate-50">
                <td className="p-3 font-medium">{cust.company_name}</td>
                <td className="px-6 py-3">
                  <div className="font-medium text-gray-800">{cust.first_name} {cust.last_name}</div>
                  <div className="text-xs text-gray-500">{cust.phone}</div>
                </td>
                <td className="p-3">{cust.email}</td>
                <td className="p-3">{cust.phone}</td>
                <td className="p-3">{cust.delivery_zone || '—'}</td>
                <td className="p-3">{cust.total_orders ?? 0}</td>
                <td className="p-3">{cust.last_order || '—'}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${cust.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600'}`}>
                    {cust.status}
                  </span>
                </td>
                <td className="p-3 text-right flex gap-2 justify-end">
                  <Button variant="outline" size="icon" onClick={() => handleView(cust)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleEdit(cust)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleViewPricing(cust)}>
                    <DollarSign className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination Controls */}
      {customers.length > 0 && (
        <div className="flex justify-between items-center px-6 py-4 border-t">
          <p className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, customers.length)} of {customers.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={indexOfLastItem >= customers.length}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

        {customers.length === 0 && (
          <div className="text-center text-slate-500 py-6 border-t">No customers found.</div>
        )}
      </div>

      


      {/* ---------- VIEW DETAILS MODAL ---------- */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Customer Details
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              View complete customer information
            </DialogDescription>
          </DialogHeader>

          {viewCustomer && (
            <div className="space-y-6 text-sm text-gray-700 mt-3">
              {/* Basic Information */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>

                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Company Name:</p>
                    <p className="font-medium">{viewCustomer.company_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Contact Name:</p>
                    <p className="font-medium">{viewCustomer.first_name} {viewCustomer.last_name}</p>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Email:</p>
                    <p className="font-medium">
                      <a href={`mailto:${viewCustomer.email}`} className="text-[#00a1ff] hover:underline">
                        {viewCustomer.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Phone Number:</p>
                    <p className="font-medium">
                      <a href={`tel:${viewCustomer.phone}`} className="text-[#00a1ff] hover:underline">
                        {viewCustomer.phone}
                      </a>
                    </p>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Delivery Zone:</p>
                    <p className="font-medium">{viewCustomer.delivery_zone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Registration Date:</p>
                    <p className="font-medium">{viewCustomer.registration_date || '2024-01-15'}</p>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Order History</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Total Orders:</p>
                    <p className="font-medium">{viewCustomer.total_orders}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Last Order Date:</p>
                    <p className="font-medium">{viewCustomer.last_order}</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Pricing</h3>
                {viewCustomer.custom_price_per_unit || viewCustomer.custom_price_per_case ? (
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-800 text-white text-xs font-semibold px-2 py-1 rounded">
                      Custom Pricing
                    </span>
                    <span className="text-gray-700">This customer has custom pricing configured</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
                      Standard Pricing
                    </span>
                    <span className="text-gray-700">No custom pricing set</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="ghost">Close</Button>
            </DialogClose>
            {viewCustomer && (
              <Button
                onClick={() => {
                  setViewModalOpen(false)
                  handleEdit(viewCustomer)
                }}
                className="bg-[#00a1ff] hover:bg-[#0090e6] text-white"
              >
                Edit Customer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* ---------- EXISTING PRICING MODAL ---------- */}
      <Dialog open={pricingModalOpen} onOpenChange={setPricingModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Manage Pricing for {pricingCustomer?.company_name || ''}
            </DialogTitle>
            <DialogDescription>
              View or update pricing for this customer.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Custom Pricing</Label>
              <div
                onClick={() =>
                  setCustomPricing((p) => ({ ...p, enabled: !p.enabled }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition ${customPricing.enabled ? 'bg-[#00a1ff]' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform bg-white rounded-full transition ${customPricing.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </div>
            </div>

            {customPricing.enabled && (
              <>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-500 font-medium mb-2">
                    Standard Pricing (Current)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Price per Case</Label>
                      <Input readOnly value={pricingCustomer?.custom_price_per_case || ''} className="bg-gray-100 text-gray-700" />
                    </div>
                    <div>
                      <Label>Price per Unit</Label>
                      <Input readOnly value={pricingCustomer?.custom_price_per_unit || ''} className="bg-gray-100 text-gray-700" />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-medium mb-2">Update Pricing</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Price per Case</Label>
                      <Input type="number" step="0.01" value={customPricing.case} onChange={(e) => setCustomPricing((p) => ({ ...p, case: e.target.value }))} placeholder="Enter new price" />
                    </div>
                    <div>
                      <Label>Price per Unit</Label>
                      <Input type="number" step="0.01" value={customPricing.unit} onChange={(e) => setCustomPricing((p) => ({ ...p, unit: e.target.value }))} placeholder="Enter new price" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSavePricing} className='rounded-lg bg-[#00a1ff] hover:bg-[#0090e6] text-white text-base font-semibold'>Save Pricing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
