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
import { Plus, Edit, Trash2 } from 'lucide-react'

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
  delivery_zone?: string | number
  industry?: string
  status?: string
  total_orders?: number
  last_order?: string
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
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState<any>({
    company: '', firstName: '', lastName: '', email: '',
    phone: '', address: '', industry: '', deliveryZone: '',
    customPriceUnit: '', companyLogo: ''
  })

  const updateForm = (key: string, value: any) => {
    setForm((p: any) => ({ ...p, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' })) // remove error when typing
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
          .select('id, order_name, order_date')
          .eq('customer_id', cust.id)
          .order('order_date', { ascending: false })

        const zoneName = newDriverMap.get(String(cust.delivery_zone)) || '—'

        return {
          ...cust,
          delivery_zone: zoneName,
          total_orders: orders?.length || 0,
          last_order: orders?.[0]?.order_name || '—',
        }
      })
    )

    setCustomers(customersWithOrders)
  }

  const resetForm = () => {
    setForm({
      company: '', firstName: '', lastName: '', email: '',
      phone: '', address: '', industry: '', deliveryZone: '',
      customPriceUnit: '', companyLogo: ''
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
      setOpen(false)
      resetForm()
      fetchData()
    } else {
      console.error(error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (!error) fetchData()
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
      companyLogo: cust.company_logo || ''
    })
    setOpen(true)
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

          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
              <DialogDescription>
                {editCustomer
                  ? 'Update the selected customer details.'
                  : 'Enter the customer information to add them to the system.'}
              </DialogDescription>
            </DialogHeader>

            {/* Form Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {/* Left side */}
              <div className="space-y-3">
                <div>
                  <Label>Company Name *</Label>
                  <Input value={form.company} onChange={(e) => updateForm('company', e.target.value)} />
                  {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First Name *</Label>
                    <Input value={form.firstName} onChange={(e) => updateForm('firstName', e.target.value)} />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input value={form.lastName} onChange={(e) => updateForm('lastName', e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label>Phone *</Label>
                  <Input value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <Label>Address *</Label>
                  <Textarea value={form.address} onChange={(e) => updateForm('address', e.target.value)} />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
              </div>

              {/* Right side */}
              <div className="space-y-3">
                <div>
                  <Label>Email *</Label>
                  <Input value={form.email} onChange={(e) => updateForm('email', e.target.value)} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label>Delivery Zone *</Label>
                  <Select onValueChange={(v) => updateForm('deliveryZone', v)} value={String(form.deliveryZone)}>
                    <SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger>
                    <SelectContent>
                      {drivers.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.deliveryZone && <p className="text-red-500 text-xs mt-1">{errors.deliveryZone}</p>}
                </div>

                <div>
                  <Label>Custom Price per Unit</Label>
                  <Input value={form.customPriceUnit} onChange={(e) => updateForm('customPriceUnit', e.target.value)} />
                </div>

                <div>
                  <Label>Industry</Label>
                  <Input value={form.industry} onChange={(e) => updateForm('industry', e.target.value)} />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4 flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSave}>{editCustomer ? 'Update' : 'Save'}</Button>
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
            {customers.map((cust) => (
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
                  <Button variant="outline" size="icon" onClick={() => handleEdit(cust)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(cust.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {customers.length === 0 && (
          <div className="text-center text-slate-500 py-6 border-t">No customers found.</div>
        )}
      </div>
    </div>
  )
}
