'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle, Truck, Send, Package, Clock, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { supabase } from '@/lib/supabaseClient'

interface Driver {
  id: number
  driver_name: string
  phone_number?: string
  email?: string
  vehicle_id?: string
  zone?: string
  shift_start?: string
  shift_end?: string
  capacity?: number
  created_at?: string
  status?: string
}

export default function DriverManagementPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false) // modal open
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Driver | null>(null)

  // form state
  const [form, setForm] = useState({
    driver_name: '',
    phone_number: '',
    email: '',
    vehicle_id: '',
    zone: '',
    shift_start: '08:00',
    shift_end: '16:00',
    capacity: 1,
    status: 'Available',
  })

  useEffect(() => {
    fetchDrivers()
  }, [])

  async function fetchDrivers() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('id', { ascending: true })

      if (error) {
        console.error('Fetch drivers error:', error)
        return
      }
      setDrivers(data || [])
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setEditing(null)
    setForm({
      driver_name: '',
      phone_number: '',
      email: '',
      vehicle_id: '',
      zone: '',
      shift_start: '08:00',
      shift_end: '16:00',
      capacity: 1,
      status: 'Available',
    })
    setOpen(true)
  }

  function openEditModal(d: Driver) {
    setEditing(d)
    setForm({
      driver_name: d.driver_name || '',
      phone_number: d.phone_number || '',
      email: d.email || '',
      vehicle_id: d.vehicle_id || '',
      zone: d.zone || '',
      // if stored with seconds, take first 5 chars for <input type=time>
      shift_start: d.shift_start ? d.shift_start.slice(0,5) : '08:00',
      shift_end: d.shift_end ? d.shift_end.slice(0,5) : '16:00',
      capacity: d.capacity ?? 1,
      status: d.status || 'Available',
    })
    setOpen(true)
  }

  async function handleSave(e?: React.SyntheticEvent) {
    if (e) e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        driver_name: form.driver_name,
        phone_number: form.phone_number || null,
        email: form.email || null,
        vehicle_id: form.vehicle_id || null,
        zone: form.zone || null,
        // Save time as HH:MM:SS (Postgres time) so append :00 if missing seconds
        shift_start: form.shift_start?.length === 5 ? `${form.shift_start}:00` : form.shift_start,
        shift_end: form.shift_end?.length === 5 ? `${form.shift_end}:00` : form.shift_end,
        capacity: form.capacity ? Number(form.capacity) : null,
        status: form.status || 'Available',
      }

      if (editing) {
        const { error } = await supabase
          .from('drivers')
          .update(payload)
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('drivers')
          .insert([payload])
        if (error) throw error
      }

      setOpen(false)
      await fetchDrivers()
    } catch (err) {
      console.error('Save driver error:', err)
      alert('Could not save driver. Check console for details.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id?: number) {
    if (!id) return
    const ok = confirm('Are you sure you want to delete this driver?')
    if (!ok) return
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id)
      if (error) throw error
      await fetchDrivers()
    } catch (err) {
      console.error('Delete driver error:', err)
      alert('Could not delete driver. Check console for details.')
    }
  }

  // stats
  const total = drivers.length
  const available = drivers.filter(d => (d.status || '').toLowerCase() === 'available').length
  const enroute = drivers.filter(d => (d.status || '').toLowerCase() === 'en route' || (d.status || '').toLowerCase() === 'enroute').length
  const assigned = drivers.filter(d => (d.status || '').toLowerCase() === 'assigned').length
  const offDuty = drivers.filter(d => (d.status || '').toLowerCase() === 'off duty' || (d.status || '').toLowerCase() === 'off-duty').length

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Driver Management</h1>
        <p className="text-sm text-gray-500">
          Manage drivers, view routes, and track delivery capacity for CoconutStock HQ - Primary Store
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-none shadow-sm hover:shadow-md bg-white transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Drivers</CardTitle>
            <div className="rounded-xl bg-blue-50 p-2">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-800">{total}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md bg-white transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Available</CardTitle>
            <div className="rounded-xl bg-green-50 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-800">{available}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md bg-white transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">En Route</CardTitle>
            <div className="rounded-xl bg-purple-50 p-2">
              <Send className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-800">{enroute}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md bg-white transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Assigned</CardTitle>
            <div className="rounded-xl bg-sky-50 p-2">
              <Package className="h-5 w-5 text-sky-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-800">{assigned}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md bg-white transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Off Duty</CardTitle>
            <div className="rounded-xl bg-gray-50 p-2">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-800">{offDuty}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <input
          type="text"
          placeholder="Search by name, phone, or vehicle..."
          className="w-full sm:w-auto flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          onChange={(e) => {
            const q = e.target.value.toLowerCase()
            if (!q) return fetchDrivers()
            // client side filter
            setDrivers(prev => prev.filter(d =>
              (d.driver_name || '').toLowerCase().includes(q) ||
              (d.phone_number || '').toLowerCase().includes(q) ||
              (d.vehicle_id || '').toLowerCase().includes(q)
            ))
          }}
        />
        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          <select
            onChange={(e) => {
              const v = e.target.value
              if (v === 'All') return fetchDrivers()
              setDrivers(prev => prev.filter(d => ((d.status || '').toLowerCase() === v.toLowerCase())))
            }}
            className="border border-gray-300 rounded-md text-sm p-2 text-gray-700"
          >
            <option value="All">All Status</option>
            <option>Available</option>
            <option>En Route</option>
            <option>Assigned</option>
            <option>Off Duty</option>
          </select>
          <button
            onClick={openAddModal}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow"
          >
            + Add Driver
          </button>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-700">All Drivers</h2>
          {loading ? <div className="text-xs text-gray-500">Loading…</div> : null}
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 font-medium">Driver</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Vehicle</th>
              <th className="px-6 py-3 font-medium">Zone</th>
              <th className="px-6 py-3 font-medium">Shift</th>
              <th className="px-6 py-3 font-medium">Capacity</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {drivers.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <div className="font-medium text-gray-800">{d.driver_name}</div>
                  <div className="text-xs text-gray-500">{d.phone_number}</div>
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      (d.status || '').toLowerCase() === 'available'
                        ? 'bg-green-100 text-green-700'
                        : (d.status || '').toLowerCase() === 'en route' || (d.status || '').toLowerCase() === 'enroute'
                        ? 'bg-purple-100 text-purple-700'
                        : (d.status || '').toLowerCase() === 'assigned'
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-700">{d.vehicle_id}</td>
                <td className="px-6 py-3 text-gray-700">{d.zone}</td>
                <td className="px-6 py-3 text-gray-700">
                  {d.shift_start ? d.shift_start.slice(0,5) : '—'} - {d.shift_end ? d.shift_end.slice(0,5) : '—'}
                </td>
                <td className="px-6 py-3 text-gray-700">{d.capacity ?? '—'}</td>
                <td className="px-6 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(d)}
                      className="text-sky-600 hover:underline text-sm font-medium inline-flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="text-rose-600 hover:underline text-sm font-medium inline-flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="text-center p-6 text-sm text-gray-500">No drivers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Driver Modal (simple custom modal) */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-800">{editing ? 'Edit Driver' : 'Add New Driver'}</h3>
              <button
                onClick={() => { setOpen(false); setEditing(null) }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <Label>Driver Name</Label>
                <Input value={form.driver_name} onChange={(e) => setForm(prev => ({ ...prev, driver_name: e.target.value }))} placeholder="Driver full name" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone_number} onChange={(e) => setForm(prev => ({ ...prev, phone_number: e.target.value }))} placeholder="+1 305-..." />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} placeholder="email@example.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Vehicle ID</Label>
                  <Input value={form.vehicle_id} onChange={(e) => setForm(prev => ({ ...prev, vehicle_id: e.target.value }))} placeholder="VAN-101" />
                </div>
                <div>
                  <Label>Zone</Label>
                  <Input value={form.zone} onChange={(e) => setForm(prev => ({ ...prev, zone: e.target.value }))} placeholder="Zone A - Miami Beach" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Shift Start</Label>
                  <input type="time" value={form.shift_start} onChange={(e) => setForm(prev => ({ ...prev, shift_start: e.target.value }))} className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <Label>Shift End</Label>
                  <input type="time" value={form.shift_end} onChange={(e) => setForm(prev => ({ ...prev, shift_end: e.target.value }))} className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <input type="number" min={1} value={form.capacity} onChange={(e) => setForm(prev => ({ ...prev, capacity: Number(e.target.value) }))} className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm" />
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="En Route">En Route</SelectItem>
                    <SelectItem value="Assigned">Assigned</SelectItem>
                    <SelectItem value="Off Duty">Off Duty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => { setOpen(false); setEditing(null) }} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium shadow">
                  {saving ? 'Saving…' : editing ? 'Update Driver' : 'Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
