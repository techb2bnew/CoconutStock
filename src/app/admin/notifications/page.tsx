'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function NotificationsPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold">Send Notification</h1>
      <Card>
        <CardHeader>
          <CardTitle>Compose Notification</CardTitle>
          <CardDescription>Send a push notification to users, drivers, or franchises.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Group</Label>
            <Select>
              <SelectTrigger id="recipient">
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="customers">Customers</SelectItem>
                <SelectItem value="drivers">Drivers</SelectItem>
                <SelectItem value="franchises">Franchises</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Enter notification title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Enter notification message" className="min-h-[120px]" />
          </div>
          <Button>Send Notification</Button>
        </CardContent>
      </Card>
    </div>
  );
}
