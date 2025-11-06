'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const staff = [
    { id: "1", name: "Michael Scott", email: "michael@dundermifflin.com", role: "Manager", status: "Active" },
    { id: "2", name: "Dwight Schrute", email: "dwight@dundermifflin.com", role: "Sales", status: "Active" },
    { id: "3", name: "Jim Halpert", email: "jim@dundermifflin.com", role: "Sales", status: "Inactive" },
    { id: "4", name: "Pam Beesly", email: "pam@dundermifflin.com", role: "Receptionist", status: "Active" },
    { id: "5", name: "Oscar Martinez", email: "oscar@dundermifflin.com", role: "Accountant", status: "Active" },
];

export default function StaffPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Staff</h1>
                <Button>Add Staff Member</Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Staff List</CardTitle>
                    <CardDescription>Manage your staff members and their roles.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staff.map((member, index) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="hidden h-9 w-9 sm:flex">
                                                <AvatarImage src={`https://picsum.photos/seed/staff-${index}/40/40`} alt="Avatar" data-ai-hint="people avatar" />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="grid gap-1">
                                                <p className="text-sm font-medium leading-none">{member.name}</p>
                                                <p className="text-sm text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{member.role}</TableCell>
                                    <TableCell>
                                        <Badge variant={member.status === "Active" ? "secondary" : "outline"}>{member.status}</Badge>
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
                                                <DropdownMenuItem>Change Role</DropdownMenuItem>
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
