'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"

const orders = [
  {
    id: "ORD-1001",
    logo: "/logos/coconut.png",
    customer: "Hilton Hotel Miami",
    contact: "John Smith",
    product: "150 Cases",
    po: "PO-2025-001",
    orderDate: "2025-01-20 09:30 AM",
    deliveryDate: "2025-01-22",
    status: "Pending",
    driver: "-",
    amount: "$750.00"
  },
  {
    id: "ORD-1002",
    logo: "/logos/coconut.png",
    customer: "Ocean View Restaurant",
    contact: "Maria Garcia",
    product: "5 Cases",
    po: "-",
    orderDate: "2025-01-20 10:15 AM",
    deliveryDate: "2025-01-21",
    status: "In Progress",
    driver: "-",
    amount: "$375.00"
  },
  {
    id: "ORD-1003",
    logo: "/logos/paradise.png",
    customer: "Paradise Events",
    contact: "David Johnson",
    product: "200 Units",
    po: "PO-PE-456",
    orderDate: "2025-01-19 02:45 PM",
    deliveryDate: "2025-01-23",
    status: "Dispatched",
    driver: "Mike Driver",
    amount: "$900.00"
  },
  {
    id: "ORD-1004",
    logo: "/logos/hilton.png",
    customer: "Hilton Hotel Miami",
    contact: "John Smith",
    product: "50 Units",
    po: "PO-2025-002",
    orderDate: "2025-01-18 11:20 AM",
    deliveryDate: "2025-01-20",
    status: "Delivered",
    driver: "Sarah Driver",
    amount: "$250.00"
  },
]

export default function OrderManagement() {
  const [filter, setFilter] = useState("All Orders")

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Order Management</h1>
        <p className="text-sm text-gray-500">CoconutStock HQ - Primary Store</p>
      </div>

      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 w-1/2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input placeholder="Search orders..." className="pl-8" />
          </div>
          <select
            className="border rounded-md px-3 py-2 text-sm text-gray-600"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All Orders</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Dispatched</option>
            <option>Delivered</option>
          </select>
        </div>
        <Button>Place Order for Customer</Button>
      </div>

      {/* Orders Table */}
      <Card className="mt-4">
        <CardContent className="p-6">
          <div className="text-sm font-medium mb-4">All Orders ({orders.length})</div>

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
                <TableHead>Status</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{o.id}</TableCell>
                  <TableCell>
                    <img src={o.logo} alt="" className="h-8 w-8 rounded object-cover" />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{o.customer}</div>
                    <div className="text-xs text-gray-500">{o.contact}</div>
                  </TableCell>
                  <TableCell>{o.product}</TableCell>
                  <TableCell>{o.po}</TableCell>
                  <TableCell>{o.orderDate}</TableCell>
                  <TableCell>{o.deliveryDate}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "capitalize",
                        o.status === "Pending" && "bg-yellow-100 text-yellow-700",
                        o.status === "In Progress" && "bg-blue-100 text-blue-700",
                        o.status === "Dispatched" && "bg-purple-100 text-purple-700",
                        o.status === "Delivered" && "bg-green-100 text-green-700"
                      )}
                    >
                      {o.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{o.driver}</TableCell>
                  <TableCell>{o.amount}</TableCell>
                  <TableCell className="flex gap-2">
                    <Eye className="h-4 w-4 text-gray-500 cursor-pointer" />
                    <UserPlus className="h-4 w-4 text-gray-500 cursor-pointer" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
