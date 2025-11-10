'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Edit, Trash2 } from 'lucide-react'

type Staff = {
  id: number
  name: string
  email: string
  role: string
  status: string
  last_login: string | null
  hire_date: string | null
}

export default function StaffManagementPage() {
  const [selectedTab, setSelectedTab] = useState<'All Staff' | 'Warehouse' | 'Delivery'>('All Staff')
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', role: '', hire_date: '' })
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
const itemsPerPage = 10


  
  const fetchStaff = async () => {
    const { data, error } = await supabase.from('staff').select('*').order('id', { ascending: true })
    if (error) console.error('Fetch error:', error)
    else setStaffList(data || [])
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const filteredStaff =
    selectedTab === 'All Staff'
      ? staffList
      : staffList.filter((s) => s.role === selectedTab)


      const indexOfLastItem = currentPage * itemsPerPage
const indexOfFirstItem = indexOfLastItem - itemsPerPage
const currentStaff = filteredStaff.slice(indexOfFirstItem, indexOfLastItem)

  const openModal = (staff?: Staff) => {
    if (staff) {
      setEditingStaff(staff)
      setFormData({
        name: staff.name,
        email: staff.email,
        role: staff.role,
        hire_date: staff.hire_date ? staff.hire_date.split('T')[0] : ''
      })
    } else {
      setEditingStaff(null)
      setFormData({ name: '', email: '', role: '', hire_date: '' })
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (editingStaff) {
      const { error } = await supabase
        .from('staff')
        .update({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          hire_date: formData.hire_date
        })
        .eq('id', editingStaff.id)

      if (error) console.error('Update error:', error)
    } else {
      const { error } = await supabase
        .from('staff')
        .insert([{ ...formData, status: 'Active' }])

      if (error) console.error('Insert error:', error)
    }

    setLoading(false)
    setModalOpen(false)
    fetchStaff()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return
    const { error } = await supabase.from('staff').delete().eq('id', id)
    if (error) console.error('Delete error:', error)
    else fetchStaff()
  }

  return (
    <div className="p-6 space-y-6 bg-[#f9fafb] min-h-screen">

      <div>
        <h1 className="text-2xl font-semibold">Staff Management</h1>
        <p className="text-sm text-gray-500">CoconutStock HQ - Primary Store</p>
      </div>

      {/* Tabs + Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {['All Staff', 'Warehouse', 'Delivery'].map((tab) => (
            <Button
              key={tab}
              variant={selectedTab === tab ? 'default' : 'outline'}
              onClick={() => setSelectedTab(tab as any)}
              className={
                selectedTab === tab
                  ? 'bg-sky-500 text-white hover:bg-sky-600'
                  : 'bg-white text-gray-700 border hover:bg-gray-100'
              }
            >
              {tab}
            </Button>
          ))}
        </div>

        <Button
          className="bg-sky-500 hover:bg-sky-600 text-white"
          onClick={() => openModal()}
        >
          <span className="text-lg font-bold mr-1">+</span> Add Staff Member
        </Button>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-medium text-gray-800">
            All Staff Members ({filteredStaff.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
  {currentStaff.map((member) => (
    <TableRow key={member.id}>
      <TableCell>{member.name}</TableCell>
      <TableCell>
        <a href={`mailto:${member.email}`} className="text-sky-600 hover:underline">
          {member.email}
        </a>
      </TableCell>
      <TableCell>
        <Badge
          className={
            member.role === 'Warehouse'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
          }
        >
          {member.role}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className="bg-black text-white">{member.status}</Badge>
      </TableCell>
      <TableCell>
        {member.hire_date
          ? new Date(member.hire_date).toLocaleDateString()
          : '—'}
      </TableCell>
      <TableCell className="flex space-x-3">
        <button
          onClick={() => openModal(member)}
          className="text-sky-600 hover:underline"
        >
          <Edit className="h-4 w-4" />
        </button>
        {/* <button className="text-sky-600 hover:underline">Reset Password</button> */}
        <button
          onClick={() => handleDelete(member.id)}
          className="text-red-600 hover:underline"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </TableCell>
    </TableRow>
  ))}
  {currentStaff.length === 0 && (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-6 text-gray-500">
        No staff found.
      </TableCell>
    </TableRow>
  )}
</TableBody>

          </Table>

          {/* Pagination Controls */}
{filteredStaff.length > 0 && (
  <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
    <p className="text-sm text-gray-600">
      Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredStaff.length)} of {filteredStaff.length}
    </p>
    <div className="flex gap-2">
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1.5 rounded-md border text-sm ${
          currentPage === 1
            ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
            : 'text-gray-700 bg-white hover:bg-gray-100'
        }`}
      >
        Previous
      </button>
      <button
        onClick={() =>
          setCurrentPage((p) =>
            indexOfLastItem < filteredStaff.length ? p + 1 : p
          )
        }
        disabled={indexOfLastItem >= filteredStaff.length}
        className={`px-3 py-1.5 rounded-md border text-sm ${
          indexOfLastItem >= filteredStaff.length
            ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
            : 'text-gray-700 bg-white hover:bg-gray-100'
        }`}
      >
        Next
      </button>
    </div>
  </div>
)}

          {filteredStaff.length === 0 && (
            <div className="p-6 text-center text-gray-500">No staff found.</div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
            </DialogTitle>
            <DialogDescription>
              {editingStaff
                ? 'Update the details below and save changes.'
                : 'Enter the details of the new staff member.'}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-sky-200 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-sky-200 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select a role</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Delivery">Delivery</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hire Date
              </label>
              <input
                type="date"
                value={formData.hire_date}
                onChange={(e) =>
                  setFormData({ ...formData, hire_date: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-sky-500 hover:bg-sky-600 text-white flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : editingStaff ? (
                  'Save Changes'
                ) : (
                  'Add Staff Member'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
