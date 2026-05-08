"use client";

import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { CheckCircle2 } from "lucide-react";
import api from "@/api";

type FeatureItem = {
  label: string;
  value: string;
};

type Subscription = {
  id: string;
  plan: string;
  status: string;
  startDate: string;
  renewalDate: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
  billingCycle: string;
  features: FeatureItem[];
};

type SubscriptionHistoryItem = {
  subscription_id: string;
  start_date: string;
  end_date: string;
  status: string;
  billing_cycle: string;
  Tier?: {
    name: string;
    price: number;
  };
};

type FeaturesCache = {
  STORAGE_LIMIT?: number;
  MAX_DEVICES?: number;
  MAX_ADS?: number;
  LIVE_STREAMING?: boolean;
  PROOF_OF_PLAY?: boolean;
  LIVE_IN_LAYOUT?: boolean;
};

export default function ClientSubscriptionPage() {
  // const [currentSubscription, setCurrentSubscription] = useState<{
  //   features: { label: string; value: string }[];
  // } | null>(null);
  // const [history, setHistory] = useState([]);
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);

  const [history, setHistory] = useState<SubscriptionHistoryItem[]>([]);
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
        features: formatFeatures(sub.features_cache),
      };

      setCurrentSubscription(formatted);

      console.log("formatted subscription:", formatted);
    } catch (error: any) {
      console.error("Error fetching clients:", error);
    }
  };

  // const formatFeatures = (features: FeaturesCache = {}) => {
  //   const GB = 1024 * 1024 * 1024;

  //   return [
  //     {
  //       label: "Storage",
  //       value: features.STORAGE_LIMIT
  //         ? `${Math.round(features.STORAGE_LIMIT / GB)} GB`
  //         : "0 GB",
  //     },
  //     {
  //       label: "Devices",
  //       value: features.MAX_DEVICES
  //         ? `${features.MAX_DEVICES} Devices`
  //         : "0 Devices",
  //     },
  //     {
  //       label: "Ads",
  //       value: features.MAX_ADS ? `${features.MAX_ADS} Ads` : "0 Ads",
  //     },
  //     {
  //       label: "Live Streaming",
  //       value: features.LIVE_STREAMING ? "Enabled" : "Disabled",
  //     },
  //     {
  //       label: "Proof of Play",
  //       value: features.PROOF_OF_PLAY ? "Enabled" : "Disabled",
  //     },
  //     {
  //       label: "Live in Layout",
  //       value: features.LIVE_IN_LAYOUT ? "Enabled" : "Disabled",
  //     },
  //   ];
  // };

  const formatFeatures = (features: any = {}) => {
    const GB = 1024 * 1024 * 1024;

    const toNumber = (val: any) => Number(val || 0);
    const toBool = (val: any) => val === true || val === "true";

    const formatKey = (key: string) =>
      key
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());

    return Object.keys(features).map((key) => {
      const value = features[key];

      // STORAGE (convert bytes → GB)
      if (key === "STORAGE_LIMIT") {
        return {
          label: "Storage",
          value: `${Math.round(toNumber(value) / GB)} GB`,
        };
      }

      // BOOLEAN FEATURES
      if (value === "true" || value === "false" || typeof value === "boolean") {
        return {
          label: formatKey(key),
          value: toBool(value) ? "Enabled" : "Disabled",
        };
      }

      // NUMBER FEATURES
      return {
        label: formatKey(key),
        value: `${toNumber(value)}`,
      };
    });
  };
  useEffect(() => {
    fetchClients();
  }, []);

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
          {currentSubscription ? (
            <Card className="mb-8 border-slate-200 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-slate-900">
                      {currentSubscription?.plan}
                    </CardTitle>
                    <CardDescription>Your current plan</CardDescription>
                  </div>
                  {/* {currentSubscription?.status === "active" && ( */}
                  <Badge className="bg-green-100 text-green-800 rounded-full text-base px-4 py-1">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Active
                  </Badge>
                  {/* )} */}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Monthly Cost</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {currentSubscription?.currency}
                      {currentSubscription?.amount}
                    </p>
                    {/* <p className="text-xs text-slate-500">
                    Billed yearly as {currentSubscription?.currency}
                    {currentSubscription?.amount.toLocaleString()}
                  </p> */}
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
                    {currentSubscription?.features?.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-slate-700">
                          <span className="font-medium">{feature.label}:</span>{" "}
                          {feature.value}
                        </span>
                      </div>
                    ))}
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
          ) : (
            <div className="mb-8 border-slate-200 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-center">
                  <div>
                    <CardTitle className="text-2xl text-slate-900">
                      No Subscription
                    </CardTitle>
                    <CardDescription>
                      You don&apos;t have a subscription yet.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </div>
          )}

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
                        {/* Status */}
                        <p className="font-medium text-slate-900 capitalize">
                          {item.Tier?.name.toUpperCase() || "No Plan"}
                        </p>

                        {/* Dates */}
                        <p className="text-sm text-slate-600">
                          {new Date(item.start_date).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}{" "}
                          →{" "}
                          {new Date(item.end_date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      {/* RIGHT */}
                      <div className="text-right">
                        <p className="text-sm text-slate-600 capitalize">
                          {item.billing_cycle}
                        </p>

                        {/* Price */}
                        <p className="text-sm font-medium text-slate-800">
                          ₹{item.Tier?.price ?? 0}
                        </p>

                        <Badge
                          className={`rounded-full cursor-default pointer-events-none ${
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
    </div>
  );
}
