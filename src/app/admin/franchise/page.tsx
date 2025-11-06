'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const franchises = [
    { id: "1", name: "Seda Downtown", location: "New York, NY", owner: "Walter White", status: "Active" },
    { id: "2", name: "Seda Uptown", location: "New York, NY", owner: "Jesse Pinkman", status: "Active" },
    { id: "3", name: "Seda Suburbs", location: "Los Angeles, CA", owner: "Saul Goodman", status: "Inactive" },
    { id: "4", name: "Seda Beachside", location: "Miami, FL", owner: "Gus Fring", status: "Active" },
];

export default function FranchisePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Franchise Management</h1>
                <Button>Add Franchise</Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Franchise List</CardTitle>
                    <CardDescription>Manage your franchise locations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Franchise Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {franchises.map((franchise) => (
                                <TableRow key={franchise.id}>
                                    <TableCell className="font-medium">{franchise.name}</TableCell>
                                    <TableCell>{franchise.location}</TableCell>
                                    <TableCell>{franchise.owner}</TableCell>
                                    <TableCell>
                                        <Badge variant={franchise.status === "Active" ? "secondary" : "outline"}>{franchise.status}</Badge>
                                    </TableCell>
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
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Delete</DropdownMenuItem>
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
