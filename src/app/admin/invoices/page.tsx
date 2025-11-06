'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Download } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const invoices = [
    { id: "INV001", customer: "John Doe", date: "2023-11-23", status: "Paid", amount: "$250.50" },
    { id: "INV002", customer: "Jane Smith", date: "2023-11-22", status: "Pending", amount: "$150.00" },
    { id: "INV003", customer: "Sam Wilson", date: "2023-11-21", status: "Overdue", amount: "$580.75" },
    { id: "INV004", customer: "Alice Johnson", date: "2023-11-20", status: "Paid", amount: "$350.00" },
    { id: "INV005", customer: "Bob Brown", date: "2023-11-19", status: "Paid", amount: "$980.20" },
];

export default function InvoicesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Invoices</h1>
                <Button>Create Invoice</Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Invoice List</CardTitle>
                    <CardDescription>Manage customer invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.id}</TableCell>
                                    <TableCell>{invoice.customer}</TableCell>
                                    <TableCell>{invoice.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={invoice.status === "Paid" ? "secondary" : invoice.status === "Pending" ? "outline" : "destructive"}>{invoice.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{invoice.amount}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Download className="h-4 w-4"/>
                                                <span className="sr-only">Download</span>
                                            </Button>
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
                                                    <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
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
