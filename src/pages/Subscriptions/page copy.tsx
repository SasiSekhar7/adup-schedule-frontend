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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, MoreHorizontal, Edit2, Trash2, Eye } from "lucide-react";
import api from "@/api";

const mockClients = [
  {
    id: 101,
    clientName: "New Client One",
    email: "new1@gmail.com",
  },
  {
    id: 102,
    clientName: "Startup Fresh",
    email: "fresh@startup.com",
  },
];
// Mock data
const mockSubscriptions = [
  {
    id: 1,
    clientName: "Acme Corp",
    email: "contact@acmecorp.com",
    plan: "Professional",
    status: "active",
    startDate: "2024-01-15",
    renewalDate: "2025-01-15",
    amount: 4999,
    currency: "₹",
  },
  {
    id: 2,
    clientName: "Tech Startup Inc",
    email: "admin@techstartup.com",
    plan: "Enterprise",
    status: "active",
    startDate: "2023-06-20",
    renewalDate: "2025-06-20",
    amount: 9999,
    currency: "₹",
  },
  {
    id: 3,
    clientName: "Small Business Ltd",
    email: "owner@smallbiz.com",
    plan: "Starter",
    status: "expired",
    startDate: "2023-03-10",
    renewalDate: "2024-03-10",
    amount: 1999,
    currency: "₹",
  },
  {
    id: 4,
    clientName: "Creative Agency",
    email: "team@creative.com",
    plan: "Professional",
    status: "active",
    startDate: "2024-05-01",
    renewalDate: "2025-05-01",
    amount: 4999,
    currency: "₹",
  },
  {
    id: 5,
    clientName: "E-commerce Plus",
    email: "support@ecomplus.com",
    plan: "Enterprise",
    status: "paused",
    startDate: "2024-02-14",
    renewalDate: "2025-02-14",
    amount: 9999,
    currency: "₹",
  },
  {
    id: 6,
    clientName: "Digital Marketing Pro",
    email: "hello@digimark.com",
    plan: "Professional",
    status: "expired",
    startDate: "2023-08-20",
    renewalDate: "2024-08-20",
    amount: 4999,
    currency: "₹",
  },
];

// ✅ ONLY CREATE MODAL UPDATED — REST SAME

// 🔽 ADD THIS ABOVE COMPONENT (you already have it, keep it)
const plans = [
  { name: "Starter", monthlyPrice: 50, yearlyPrice: 500 },
  { name: "Professional", monthlyPrice: 100, yearlyPrice: 1000 },
  { name: "Enterprise", monthlyPrice: 200, yearlyPrice: 2000 },
];

export default function ManageSubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedSubscription, setSelectedSubscription] = useState<
    (typeof mockSubscriptions)[0] | null
  >(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    plan: "",
    status: "",
    renewalPeriod: "1-month",
  });

  const [clients, setClients] = useState([]);

  const fetchClients = async () => {
    try {
      const response = await api.get("/subscribe/get-by-client");
      console.log("response of clients:-", response);
      setClients((response as any).data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };
  useEffect(() => {
    fetchClients();
  }, []);

  const [renewalPeriod, setRenewalPeriod] = useState("1-month");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [billingType, setBillingType] = useState("monthly"); // monthly | yearly
  const [duration, setDuration] = useState(1); // number of months or years

  const selectedPlanData = plans.find((p) => p.name === editFormData.plan);

  const pricePerUnit =
    billingType === "monthly"
      ? selectedPlanData?.monthlyPrice || 0
      : selectedPlanData?.yearlyPrice || 0;

  const totalAmount = pricePerUnit * duration;
  const combinedData = [
    ...mockSubscriptions.map((sub) => ({
      ...sub,
      hasSubscription: true,
    })),
    ...mockClients.map((client) => ({
      ...client,
      plan: "-",
      status: "no-subscription",
      startDate: "-",
      renewalDate: "-",
      amount: 0,
      currency: "₹",
      hasSubscription: false,
    })),
  ];

  const filteredSubscriptions = combinedData.filter((sub) => {
    const matchesSearch =
      sub.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;

    const matchesPlan = planFilter === "all" || sub.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const calculateRenewalDate = (period: string) => {
    const today = new Date();
    const renewal = new Date(today);

    switch (period) {
      case "1-month":
        renewal.setMonth(renewal.getMonth() + 1);
        break;
      case "3-month":
        renewal.setMonth(renewal.getMonth() + 3);
        break;
      case "6-month":
        renewal.setMonth(renewal.getMonth() + 6);
        break;
      case "1-year":
        renewal.setFullYear(renewal.getFullYear() + 1);
        break;
    }

    return renewal.toISOString().split("T")[0];
  };

  const handleCancelSubscription = () => {
    console.log("[v0] Subscription cancelled:", selectedSubscription?.id);
    setIsCancelConfirmOpen(false);
    setIsDetailOpen(false);
    setIsEditOpen(false);
  };

  const handleSaveChanges = () => {
    const renewalDate = calculateRenewalDate(renewalPeriod);
    console.log("[v0] Subscription saved:", {
      id: selectedSubscription?.id,
      plan: editFormData.plan,
      status: editFormData.status,
      renewalDate,
    });
    setIsEditOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "no-subscription":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isSubscriptionExpired = (renewalDate: string) => {
    return new Date(renewalDate) < new Date();
  };

  const handleViewDetails = (subscription: (typeof mockSubscriptions)[0]) => {
    setSelectedSubscription(subscription);
    setIsDetailOpen(true);
  };

  const handleEdit = (subscription: (typeof mockSubscriptions)[0]) => {
    setSelectedSubscription(subscription);
    setIsEditOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Main Content */}
      <div className="flex-1">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Manage Subscriptions
            </h1>
            <p className="text-slate-600">
              View and manage all client subscriptions across all plans
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search by client name or email..."
                  className="pl-10 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-lg">
                Export Report
              </Button>
            </div>

            {/* Filter Options */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="paused">Paused</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Plan
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                >
                  <option value="all">All Plans</option>
                  <option value="Starter">Starter</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="rounded-lg border-slate-300"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setPlanFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="rounded-lg border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {mockSubscriptions.length}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Active Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {
                    mockSubscriptions.filter((s) => s.status === "active")
                      .length
                  }
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Expired Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {
                    mockSubscriptions.filter((s) => s.status === "expired")
                      .length
                  }
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  ₹
                  {mockSubscriptions
                    .filter((s) => s.status === "active")
                    .reduce((acc, s) => acc + s.amount, 0)
                    .toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Churn Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {(
                    (mockSubscriptions.filter((s) => s.status !== "active")
                      .length /
                      mockSubscriptions.length) *
                    100
                  ).toFixed(1)}
                  %
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card className="rounded-lg border-slate-200">
            <CardHeader>
              <CardTitle>All Subscriptions</CardTitle>
              <CardDescription>
                A complete list of all client subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead className="text-slate-600">
                        Client Name
                      </TableHead>
                      <TableHead className="text-slate-600">Email</TableHead>
                      <TableHead className="text-slate-600">Plan</TableHead>
                      <TableHead className="text-slate-600">Amount</TableHead>
                      <TableHead className="text-slate-600">
                        Start Date
                      </TableHead>
                      <TableHead className="text-slate-600">
                        Renewal Date
                      </TableHead>
                      <TableHead className="text-slate-600">Status</TableHead>
                      <TableHead className="text-slate-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((subscription) => (
                      <TableRow
                        key={subscription.id}
                        className={`border-slate-200 ${subscription.status === "expired" ? "bg-red-50" : ""}`}
                      >
                        <TableCell
                          className={`font-medium ${subscription.status === "expired" ? "text-red-900" : "text-slate-900"}`}
                        >
                          {subscription.clientName}
                          {subscription.status === "expired" && (
                            <span className="ml-2 text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                              EXPIRED
                            </span>
                          )}
                        </TableCell>
                        <TableCell
                          className={
                            subscription.status === "expired"
                              ? "text-red-800"
                              : "text-slate-600"
                          }
                        >
                          {subscription.email}
                        </TableCell>
                        <TableCell
                          className={
                            subscription.status === "expired"
                              ? "text-red-800"
                              : "text-slate-600"
                          }
                        >
                          {subscription.hasSubscription ? (
                            subscription.plan
                          ) : (
                            <span className="text-gray-500 italic">
                              No Plan
                            </span>
                          )}
                        </TableCell>
                        <TableCell
                          className={`font-medium ${subscription.status === "expired" ? "text-red-900" : "text-slate-900"}`}
                        >
                          {subscription.currency}
                          {subscription.amount.toLocaleString()}
                        </TableCell>
                        <TableCell
                          className={
                            subscription.status === "expired"
                              ? "text-red-800"
                              : "text-slate-600"
                          }
                        >
                          {subscription.startDate}
                        </TableCell>
                        <TableCell
                          className={
                            subscription.status === "expired"
                              ? "text-red-800 font-semibold"
                              : "text-slate-600"
                          }
                        >
                          {subscription.renewalDate}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`rounded-full ${getStatusColor(subscription.status)}`}
                          >
                            {subscription.status.charAt(0).toUpperCase() +
                              subscription.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(subscription)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSubscription(subscription);

                                  if (!subscription.hasSubscription) {
                                    // 👉 OPEN CREATE MODAL
                                    setEditFormData({
                                      plan: "Starter",
                                      status: "active",
                                      renewalPeriod: "1-month",
                                    });
                                    setIsCreateOpen(true);
                                  } else {
                                    // 👉 EDIT FLOW
                                    setEditFormData({
                                      plan: subscription.plan,
                                      status: subscription.status,
                                      renewalPeriod: "1-month",
                                    });

                                    setBillingType("monthly"); // default
                                    setDuration(1);

                                    setIsEditOpen(true);
                                  }
                                }}
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                {subscription.hasSubscription
                                  ? subscription.status === "expired"
                                    ? "Renew Subscription"
                                    : "Edit Subscription"
                                  : "Subscribe"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedSubscription(subscription);
                                  setIsCancelConfirmOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancel Subscription
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>
              View complete subscription information
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              {selectedSubscription.status === "expired" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-red-800">
                    ⚠️ This subscription has expired on{" "}
                    {selectedSubscription.renewalDate}
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Action required: Please renew or contact the client to
                    reactivate.
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  Client Name
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {selectedSubscription.clientName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Email</p>
                <p className="text-slate-900">{selectedSubscription.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    Plan
                  </p>
                  <p className="text-slate-900 font-semibold">
                    {selectedSubscription.plan}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    Status
                  </p>
                  <Badge
                    className={`rounded-full w-fit ${getStatusColor(selectedSubscription.status)}`}
                  >
                    {selectedSubscription.status.charAt(0).toUpperCase() +
                      selectedSubscription.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    Amount
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedSubscription.currency}
                    {selectedSubscription.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    Start Date
                  </p>
                  <p className="text-slate-900">
                    {selectedSubscription.startDate}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  Renewal Date
                </p>
                <p
                  className={`font-semibold ${selectedSubscription.status === "expired" ? "text-red-700" : "text-slate-900"}`}
                >
                  {selectedSubscription.renewalDate}
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1 rounded-lg">
                  Close
                </Button>
                <Button
                  className={`flex-1 rounded-lg ${selectedSubscription.status === "expired" ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {selectedSubscription.status === "expired"
                    ? "Renew Now"
                    : "Edit"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md rounded-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSubscription?.status === "expired"
                ? "Renew Subscription"
                : "Edit Subscription"}
            </DialogTitle>
            <DialogDescription>
              {selectedSubscription?.status === "expired"
                ? "Renew this expired subscription and set new renewal date"
                : "Update subscription details"}
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              {selectedSubscription.status === "expired" && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-orange-800">
                    Renewing expired subscription
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    Client: {selectedSubscription.clientName}
                  </p>
                </div>
              )}

              {/* Billing Type */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Billing Type
                </label>
                <select
                  className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg"
                  value={billingType}
                  onChange={(e) => {
                    setBillingType(e.target.value);
                    setDuration(1);
                  }}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Plan */}
              {/* Plan */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Plan
                </label>
                <select
                  className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg"
                  value={editFormData.plan}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      plan: e.target.value,
                    })
                  }
                >
                  {plans.map((plan) => (
                    <option key={plan.name} value={plan.name}>
                      {plan.name} ( ₹
                      {billingType === "monthly"
                        ? plan.monthlyPrice + "/mo"
                        : plan.yearlyPrice + "/yr"}
                      )
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  {billingType === "monthly" ? "Months" : "Years"}
                </label>

                <select
                  className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  {billingType === "monthly"
                    ? Array.from({ length: 11 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {m} Month
                        </option>
                      ))
                    : [1, 2].map((y) => (
                        <option key={y} value={y}>
                          {y} Year
                        </option>
                      ))}
                </select>
              </div>

              {/* Price Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">
                  Price per {billingType === "monthly" ? "month" : "year"}:
                </p>
                <p className="font-semibold text-green-900">₹{pricePerUnit}</p>

                <p className="text-sm mt-2 text-green-700">Total:</p>
                <p className="text-xl font-bold text-green-900">
                  ₹{totalAmount}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 rounded-lg"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className={`flex-1 rounded-lg ${selectedSubscription.status === "expired" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
                  onClick={() => {
                    const payload = {
                      id: selectedSubscription?.id,
                      plan: editFormData.plan,
                      status: editFormData.status,
                      billingType,
                      duration,
                      pricePerUnit,
                      totalAmount,
                    };

                    console.log("UPDATE SUBSCRIPTION:", payload);

                    setIsEditOpen(false);
                  }}
                >
                  {selectedSubscription.status === "expired"
                    ? "Renew & Save"
                    : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <DialogContent className="max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this subscription?
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Subscription Details:
                </p>
                <div className="space-y-1 text-sm text-slate-600">
                  <p>
                    <span className="font-medium">Client:</span>{" "}
                    {selectedSubscription.clientName}
                  </p>
                  <p>
                    <span className="font-medium">Plan:</span>{" "}
                    {selectedSubscription.plan}
                  </p>
                  <p>
                    <span className="font-medium">Amount:</span>{" "}
                    {selectedSubscription.currency}
                    {selectedSubscription.amount.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Renewal:</span>{" "}
                    {selectedSubscription.renewalDate}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                This action cannot be undone. The client will lose access to
                their subscription benefits.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-lg"
                  onClick={() => setIsCancelConfirmOpen(false)}
                >
                  Keep Subscription
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 rounded-lg"
                  onClick={handleCancelSubscription}
                >
                  Yes, Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>Create Subscription</DialogTitle>
            <DialogDescription>Assign a new subscription</DialogDescription>
          </DialogHeader>

          {selectedSubscription && (
            <div className="space-y-4">
              {/* Client */}
              <div className="bg-blue-50 p-3 rounded">
                <p className="font-semibold">
                  {selectedSubscription.clientName}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedSubscription.email}
                </p>
              </div>

              {/* Billing Type */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Billing Type
                </label>
                <select
                  className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg"
                  value={billingType}
                  onChange={(e) => {
                    setBillingType(e.target.value);
                    setDuration(1);
                  }}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Plan */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Plan
                </label>
                <select
                  className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg"
                  value={editFormData.plan}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      plan: e.target.value,
                    })
                  }
                >
                  {plans.map((plan) => (
                    <option key={plan.name} value={plan.name}>
                      {plan.name} ( ₹
                      {billingType === "monthly"
                        ? plan.monthlyPrice + "/mo"
                        : plan.yearlyPrice + "/yr"}
                      )
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  {billingType === "monthly" ? "Months" : "Years"}
                </label>

                <select
                  className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  {billingType === "monthly"
                    ? Array.from({ length: 11 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {m} Month
                        </option>
                      ))
                    : [1, 2].map((y) => (
                        <option key={y} value={y}>
                          {y} Year
                        </option>
                      ))}
                </select>
              </div>

              {/* Price Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">
                  Price per {billingType === "monthly" ? "month" : "year"}:
                </p>
                <p className="font-semibold text-green-900">₹{pricePerUnit}</p>

                <p className="text-sm mt-2 text-green-700">Total:</p>
                <p className="text-xl font-bold text-green-900">
                  ₹{totalAmount}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  className="bg-green-600 text-white"
                  onClick={() => {
                    const payload = {
                      clientId: selectedSubscription.id,
                      plan: editFormData.plan,
                      billingType,
                      duration,
                      pricePerUnit,
                      totalAmount,
                    };

                    console.log("CREATE SUBSCRIPTION:", payload);

                    setIsCreateOpen(false);
                  }}
                >
                  Create
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
