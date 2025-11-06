'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function DeliveryRulesPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Delivery Rules</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Shipping Settings</CardTitle>
                    <CardDescription>Configure your delivery and shipping options.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Free Shipping</Label>
                            <p className="text-sm text-muted-foreground">Offer free shipping on orders over a certain amount.</p>
                        </div>
                        <Switch />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="free-shipping-threshold">Free Shipping Threshold ($)</Label>
                        <Input id="free-shipping-threshold" type="number" placeholder="e.g., 50" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="flat-rate">Flat Rate Shipping Fee ($)</Label>
                        <Input id="flat-rate" type="number" placeholder="e.g., 5" />
                    </div>
                    <Button>Save Settings</Button>
                </CardContent>
            </Card>
        </div>
    )
}
