"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertCircle,
  Calendar,
  CreditCard,
  Download,
  RotateCw,
  ChevronRight,
  Zap,
} from "lucide-react";
import api from "@/api";

// Mock data
// const currentSubscription = {
//   id: "SUB-12345",
//   plan: "Professional",
//   status: "active",
//   startDate: "2024-05-01",
//   renewalDate: "2025-05-01",
//   nextBillingDate: "2025-05-01",
//   amount: 4999,
//   currency: "₹",
//   billingCycle: "Yearly",
//   features: {
//     storage: "100 GB",
//     devices: "5 Devices",
//     ads: "50 Ads",
//     livestream: true,
//     proofLogs: true,
//     analytics: true,
//     support: "24/7 Email Support",
//   },
// };

const planOptions = [
  {
    id: "starter",
    name: "Starter",
    price: 1999,
    period: "/year",
    description: "Perfect for getting started",
    features: ["10 GB Storage", "1 Device", "5 Ads", "Email Support"],
    current: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 4999,
    period: "/year",
    description: "Most popular plan",
    features: [
      "100 GB Storage",
      "5 Devices",
      "50 Ads",
      "24/7 Support",
      "Analytics",
    ],
    current: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 9999,
    period: "/year",
    description: "For large teams",
    features: [
      "Unlimited Storage",
      "Unlimited Devices",
      "Unlimited Ads",
      "Priority Support",
      "Custom Features",
    ],
    current: false,
  },
];

export default function ClientSubscriptionPage() {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<
    (typeof planOptions)[0] | null
  >(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const fetchClients = async () => {
    try {
      const response = await api.get("/subscription/my_active");
      const resHistory = await api.get("/subscription/history");
      setHistory(resHistory?.data || []);
      const sub = response?.data;
      console.log("response of clients:-", sub);

      // Transform API → UI format
      const formatted = {
        id: sub.subscription_id,
        plan: sub.Tier?.name || "N/A",
        status: sub.status,
        startDate: sub.start_date,
        renewalDate: sub.end_date,
        nextBillingDate: sub.end_date,
        amount: sub.Tier?.price || 0,
        currency: "₹",
        billingCycle: sub.billing_cycle,
        features: {
          storage: `${Math.round(
            sub.features_cache?.STORAGE_LIMIT / (1024 * 1024 * 1024),
          )} GB`,
          devices: `${sub.features_cache?.MAX_DEVICES} Devices`,
          ads: `${sub.features_cache?.MAX_ADS} Ads`,
          livestream: sub.features_cache?.LIVE_STREAMING,
          proofLogs: sub.features_cache?.PROOF_OF_PLAY,
        },
      };

      setCurrentSubscription(formatted);

      console.log("formatted subscription:", formatted);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);
  const handleUpgradePlan = (plan: (typeof planOptions)[0]) => {
    setSelectedPlan(plan);
    setIsConfirmOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Main Content */}
      <div className="flex-1">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              My Subscription
            </h1>
            <p className="text-slate-600">
              Manage your subscription and billing
            </p>
          </div>

          {/* Current Plan Card */}
          <Card className="mb-8 border-slate-200 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-slate-900">
                    {currentSubscription?.plan}
                  </CardTitle>
                  <CardDescription>Your current plan</CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-800 rounded-full text-base px-4 py-1">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Monthly Cost</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {currentSubscription?.currency}
                    {(currentSubscription?.amount / 12).toFixed(0)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Billed yearly as {currentSubscription?.currency}
                    {currentSubscription?.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Start Date</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {new Date(currentSubscription?.startDate).toDateString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {currentSubscription?.billingCycle} billing cycle
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">
                    Next Billing Date
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {new Date(
                      currentSubscription?.nextBillingDate,
                    ).toDateString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {Math.ceil(
                      (new Date(
                        currentSubscription?.nextBillingDate,
                      ).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    days away
                  </p>
                </div>
              </div>

              {/* Plan Features */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm font-semibold text-slate-700 mb-4">
                  Included Features
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(currentSubscription?.features || {}).map(
                    ([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-slate-700">
                          {typeof value === "string"
                            ? value
                            : key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Actions */}
              {/* <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-lg border-slate-300"
                  onClick={() => setIsUpgradeOpen(true)}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-lg border-slate-300"
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Change Billing Cycle
                </Button>
              </div> */}
            </CardContent>
          </Card>

          {/* Billing Information */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            <Card className="rounded-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Subscription ID</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-mono text-slate-900 break-all">
                  {currentSubscription?.id}
                </p>
              </CardContent>
            </Card>

            
            <Card className="rounded-lg border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Payment Method</CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-slate-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Visa</p>
                    <p className="text-sm text-slate-600">
                      Card ending in 4242
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}

          {/* Usage Information */}
          {/* <Card className="mb-8 rounded-lg border-slate-200">
            <CardHeader>
              <CardTitle>Current Usage</CardTitle>
              <CardDescription>
                Your resource consumption this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      Storage
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      45.2 GB / 100 GB
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "45.2%" }}
                    />
                  </div>
                </div>

                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      Active Devices
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      3 / 5
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: "60%" }}
                    />
                  </div>
                </div>

                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      Active Ads
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      28 / 50
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: "56%" }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Billing History */}
          {/* <Card className="rounded-lg border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>
                    Your recent invoices and payments
                  </CardDescription>
                </div>
                <Button variant="outline" className="rounded-lg">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    date: "2024-05-01",
                    amount: "₹4999",
                    status: "Paid",
                    invoice: "INV-2024-001",
                  },
                  {
                    date: "2023-05-01",
                    amount: "₹4999",
                    status: "Paid",
                    invoice: "INV-2023-001",
                  },
                  {
                    date: "2022-05-01",
                    amount: "₹2999",
                    status: "Paid",
                    invoice: "INV-2022-001",
                  },
                ].map((invoice) => (
                  <div
                    key={invoice.invoice}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {invoice.invoice}
                      </p>
                      <p className="text-sm text-slate-600">{invoice.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-slate-900">
                        {invoice.amount}
                      </span>
                      <Badge className="bg-green-100 text-green-800 rounded-full">
                        {invoice.status}
                      </Badge>
                      <Button variant="ghost" size="sm" className="rounded">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
          <Card className="rounded-lg border-slate-200">
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
              <CardDescription>Your previous plans and trials</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-slate-500 text-sm">No history found</p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.subscription_id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      {/* LEFT */}
                      <div>
                        <p className="font-medium text-slate-900 capitalize">
                          {item.status}
                        </p>
                        <p className="text-sm text-slate-600">
                          {new Date(item.start_date).toLocaleDateString()} →{" "}
                          {new Date(item.end_date).toLocaleDateString()}
                        </p>
                      </div>

                      {/* RIGHT */}
                      <div className="text-right">
                        <p className="text-sm text-slate-600 capitalize">
                          {item.billing_cycle}
                        </p>

                        <Badge
                          className={`rounded-full ${
                            item.status === "trial"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upgrade Plan Dialog */}
      <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
        <DialogContent className="max-w-4xl rounded-lg">
          <DialogHeader>
            <DialogTitle>Choose Your Plan</DialogTitle>
            <DialogDescription>
              Upgrade to access more features and storage
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
            {planOptions.map((plan: any) => (
              <Card
                key={plan.id}
                className={`rounded-lg cursor-pointer transition border-2 ${
                  plan.current
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200"
                }`}
                onClick={() => !plan.current && handleUpgradePlan(plan)}
              >
                <CardHeader>
                  {plan.current && (
                    <Badge className="w-fit bg-blue-600 text-white rounded-full mb-2">
                      Current Plan
                    </Badge>
                  )}
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">
                    {plan?.currency || "₹"}
                    {plan.price.toLocaleString()}
                    <span className="text-xs">{plan.period}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    {plan.description}
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((feature: string) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-slate-700"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {!plan.current && (
                    <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 rounded-lg">
                      Upgrade Now
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Upgrade Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>Confirm Upgrade</DialogTitle>
            <DialogDescription>
              Upgrade to {selectedPlan?.name} plan
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-slate-700">
                  You will be charged ₹{(selectedPlan.price / 12).toFixed(0)}{" "}
                  per month for the{" "}
                  <span className="font-semibold">{selectedPlan.name}</span>{" "}
                  plan. Your new plan will be effective immediately.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Current plan refund:</span>
                  <span className="text-slate-900 font-medium">-₹1250</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">New plan charge:</span>
                  <span className="text-slate-900 font-medium">₹4999</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold">
                  <span className="text-slate-900">Amount due today:</span>
                  <span className="text-slate-900">₹3749</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-lg">
                  Cancel
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg">
                  Confirm Upgrade
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
