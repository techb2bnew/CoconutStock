'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function PricingDiscountsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Pricing & Discounts</h1>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Global Discount</CardTitle>
                        <CardDescription>Apply a discount to all products.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch id="global-discount-switch" />
                            <Label htmlFor="global-discount-switch">Enable Global Discount</Label>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discount-percentage">Discount Percentage</Label>
                            <Input id="discount-percentage" type="number" placeholder="e.g., 10" />
                        </div>
                        <Button>Save Changes</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Create Coupon Code</CardTitle>
                        <CardDescription>Generate a new coupon for customers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="coupon-code">Coupon Code</Label>
                            <Input id="coupon-code" placeholder="e.g., SUMMER20" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="coupon-value">Value (Percentage or Fixed Amount)</Label>
                            <Input id="coupon-value" placeholder="e.g., 20 or 20%" />
                        </div>
                        <Button>Create Coupon</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
