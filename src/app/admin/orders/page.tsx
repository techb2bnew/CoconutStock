'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const orders = [
    { id: "ORD001", customer: "John Doe", date: "2023-11-23", status: "Fulfilled", total: "$250.50" },
    { id: "ORD002", customer: "Jane Smith", date: "2023-11-22", status: "Pending", total: "$150.00" },
    { id: "ORD003", customer: "Sam Wilson", date: "2023-11-21", status: "Cancelled", total: "$580.75" },
    { id: "ORD004", customer: "Alice Johnson", date: "2023-11-20", status: "Fulfilled", total: "$350.00" },
    { id: "ORD005", customer: "Bob Brown", date: "2023-11-19", status: "Fulfilled", total: "$980.20" },
];

export default function OrdersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Orders</h1>
                <Button>Add Order</Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Order List</CardTitle>
                    <CardDescription>Manage your orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.customer}</TableCell>
                                    <TableCell>{order.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={order.status === "Fulfilled" ? "secondary" : order.status === "Pending" ? "outline" : "destructive"}>{order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{order.total}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Update Status</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
