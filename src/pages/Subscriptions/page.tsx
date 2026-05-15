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
import { toast } from "sonner";

type SubscriptionRow = {
  id: string;
  clientName: string;
  email: string;
  plan: string;
  status: string;
  startDate: string;
  renewalDate: string;
  amount: number;
  currency: string;
  hasSubscription: boolean;
};

type Tier = {
  tier_id: string;
  name: string;
  price: number;
  billing_cycle: "monthly" | "yearly";
  is_trial?: boolean;
};

type Client = {
  client_id: string;
  name: string;
  email: string;
  currentSubscription?: {
    tier_id: string;
    status: string;
    start_date: string;
    end_date: string;
    billing_cycle: "monthly" | "yearly";
    no_of_months: number;
    Tier?: Tier;
  };
};
// Mock data

export default function ManageSubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  // const [selectedSubscription, setSelectedSubscription] = useState<null>(null);
  const [selectedSubscription, setSelectedSubscription] =
    useState<SubscriptionRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    plan: "",
    status: "",
    renewalPeriod: "1-month",
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // you can change (5, 10, 20)

  const fetchClients = async () => {
    try {
      const response = await api.get("/subscribe/get-by-client");
      console.log("response of clients:-", response);
      setClients((response as any).data);
    } catch (error: any) {
      console.error("Error fetching clients:", error);
    }
  };

  // const [tiers, setTiers] = useState([]);
  const fetchTiers = async () => {
    const res = await api.get("/tiers_v2/all");
    console.log("tiers:-", res);
    setTiers(res.data); //  correct
  };

  useEffect(() => {
    fetchClients();
    fetchTiers();
  }, []);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [billingType, setBillingType] = useState("monthly"); // monthly | yearly
  const [duration, setDuration] = useState(1); // number of months or years
  const [buttonType, setButtonType] = useState("renew"); // monthly | yearly

  // const selectedPlanData = tiers.find((t) => t.tier_id === editFormData.plan);

  const selectedPlanData = tiers.find(
    (t) => t.tier_id === editFormData.plan && t.billing_cycle === billingType,
  );
  const pricePerUnit = selectedPlanData?.price || 0;
  const totalAmount = pricePerUnit * duration;

  const combinedData = clients.map((client: any) => {
    const sub = client.currentSubscription;

    return {
      id: client.client_id,
      clientName: client.name,
      email: client.email,

      plan: sub?.Tier?.name || "-", // adjust if API structure differs
      status: sub?.status || "no-subscription",

      startDate: sub?.start_date
        ? new Date(sub.start_date).toISOString().split("T")[0]
        : "-",

      renewalDate: sub?.end_date
        ? new Date(sub.end_date).toISOString().split("T")[0]
        : "-",

      amount: sub?.Tier?.price || 0,
      currency: "₹",

      hasSubscription: !!sub,
    };
  });

  const filteredSubscriptions = combinedData.filter((sub) => {
    const matchesSearch =
      sub.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;

    const matchesPlan = planFilter === "all" || sub.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const totalPages = Math.ceil(filteredSubscriptions.length / rowsPerPage);

  const paginatedData = filteredSubscriptions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, planFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100 cursor-default pointer-events-none";
      case "expired":
        return "bg-red-100 text-red-800 hover:bg-red-100 cursor-default pointer-events-none";
      case "inactive":
        return "bg-red-100 text-red-800 hover:bg-red-100 cursor-default pointer-events-none";
      case "paused":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 cursor-default pointer-events-none";
      case "no-subscription":
        return "bg-gray-200 text-gray-700 hover:bg-gray-200 cursor-default pointer-events-none";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 cursor-default pointer-events-none";
    }
  };

  const handleViewDetails = (subscription: null) => {
    setSelectedSubscription(subscription);
    setIsDetailOpen(true);
  };

  const handleCreateSubscription = async () => {
    try {
      // 🔍 find selected tier
      const selectedTier = tiers.find((t) => t.tier_id === editFormData.plan);

      if (!selectedTier) {
        alert("Please select a valid plan");
        return;
      }

      //  convert duration to months
      const no_of_months = billingType === "monthly" ? duration : duration * 12;

      const payload = {
        client_id: selectedSubscription?.id, // ⚠️ make sure this is UUID from API
        tier_id: selectedTier.tier_id,
        no_of_months,
        is_trial: selectedTier.is_trial === true, // you can make this dynamic later
      };

      console.log("FINAL PAYLOAD:", payload);

      const res = await api.post("/subscription/create", payload);

      console.log("CREATE RESPONSE:", res);

      // close modal
      setIsCreateOpen(false);

      // optional refresh
      fetchClients();
    } catch (error: any) {
      console.error("CREATE ERROR:", error);
      toast.error(error?.message || "Something went wrong");
    }
  };

  const handleUpdateSubscription = async () => {
    try {
      const selectedTier = tiers.find((t) => t.tier_id === editFormData.plan);

      if (!selectedTier) {
        alert("Select valid plan");
        return;
      }

      //  convert to months
      const no_of_months = billingType === "monthly" ? duration : duration * 12;

      const payload = {
        client_id: selectedSubscription?.id,
        new_tier_id: selectedTier.tier_id,
        no_of_months,
        immediate: buttonType === "renew" ? false : true,
        is_trial: selectedTier.is_trial === true, //  you can toggle later //false in renew
      };

      console.log("UPDATE PAYLOAD:", payload);

      const res = await api.put("/subscription/change", payload);

      console.log("UPDATE RESPONSE:", res);

      // close modal
      setIsEditOpen(false);

      // refresh
      fetchClients();
    } catch (error: any) {
      console.error("UPDATE ERROR:", error);
      toast.error(error?.message || "Something went wrong");
    }
  };

  const handleCancelSubscriptionApi = async () => {
    try {
      if (!selectedSubscription?.id) {
        alert("Invalid client");
        return;
      }

      const payload = {
        client_id: selectedSubscription.id, // UUID from your table
      };

      console.log("CANCEL PAYLOAD:", payload);

      const res = await api.post("/subscription/cancel", payload);

      console.log("CANCEL RESPONSE:", res);

      // close dialogs
      setIsCancelConfirmOpen(false);
      setIsDetailOpen(false);
      setIsEditOpen(false);

      // refresh data
      fetchClients();
    } catch (error: any) {
      console.error("CANCEL ERROR:", error);
      toast.error(error?.message || "Something went wrong");
    }
  };

  const isTrialPlan = selectedPlanData?.is_trial === true;

  useEffect(() => {
    if (!isEditOpen && !isCreateOpen) return;

    const filteredTiers = tiers.filter(
      (tier) => tier.billing_cycle === billingType,
    );

    if (filteredTiers.length === 0) return;

    setEditFormData((prev) => {
      // if already valid plan → keep it
      const exists = filteredTiers.find((t) => t.tier_id === prev.plan);

      if (exists) return prev;

      // else set first valid plan
      return {
        ...prev,
        plan: filteredTiers[0].tier_id,
      };
    });
  }, [billingType, tiers, isEditOpen, isCreateOpen]);
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
              {/* <Button className="bg-blue-600 hover:bg-blue-700 rounded-lg">
                Export Report
              </Button> */}
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
                  <option value="changed">Changed</option>
                  <option value="inactive">Inactive</option>
                  <option value="no-subscription">No Subscription</option>
                  <option value="cancelled">Cancelled</option>
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

                  {tiers.map((tier) => (
                    <option key={tier.tier_id} value={tier.name}>
                      {tier.name}
                    </option>
                  ))}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="rounded-lg border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {clients?.length}
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
                  {combinedData?.filter((s) => s.status === "active").length}
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
                  {combinedData?.filter((s) => s.status === "expired").length}
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
                  {combinedData
                    .filter((s) => s.status === "active")
                    .reduce((acc, s) => acc + s.amount, 0)
                    .toLocaleString()}
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
                    {paginatedData.map((subscription) => (
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
                              {/* VIEW (only if subscription exists) */}
                              {subscription.hasSubscription && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleViewDetails(subscription as any)
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSubscription(subscription);

                                  const client = clients.find(
                                    (c: any) => c.client_id === subscription.id,
                                  );

                                  const sub = client?.currentSubscription;

                                  if (!subscription.hasSubscription) {
                                    const filteredTiers = tiers.filter(
                                      (tier) =>
                                        tier.billing_cycle === billingType,
                                    );

                                    const defaultTier = filteredTiers[0];

                                    setEditFormData({
                                      plan: defaultTier?.tier_id || "",
                                      status: "active",
                                      renewalPeriod: "1-month",
                                    });

                                    setBillingType("monthly");
                                    setDuration(1);

                                    setIsCreateOpen(true);
                                  } else {
                                    // 👉 EDIT FLOW CORRECT DATA
                                    setEditFormData({
                                      plan: sub?.tier_id || "", // USE tier_id
                                      status: sub?.status || "active",
                                      renewalPeriod: "1-month",
                                    });

                                    setBillingType(
                                      sub?.billing_cycle || "monthly",
                                    ); // correct
                                    setDuration(sub?.no_of_months || 1); // correct

                                    setIsEditOpen(true);
                                    setButtonType("edit");
                                  }
                                }}
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                {subscription.hasSubscription
                                  ? // subscription.status === "expired"
                                    //   ? "Renew Subscription"
                                    "Edit Subscription"
                                  : "Subscribe"}
                              </DropdownMenuItem>

                              {/* RENEW (only if expired) */}
                              {subscription.hasSubscription && (
                                // subscription.status === "expired" &&
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedSubscription(subscription);

                                    const client = clients.find(
                                      (c: any) =>
                                        c.client_id === subscription.id,
                                    );
                                    const sub = client?.currentSubscription;

                                    setBillingType(
                                      sub?.billing_cycle || "monthly",
                                    );

                                    setEditFormData({
                                      plan: sub?.tier_id || "",
                                      status: "active",
                                      renewalPeriod: "1-month",
                                    });

                                    // convert months → proper duration
                                    const durationValue =
                                      sub?.billing_cycle === "yearly"
                                        ? (sub?.no_of_months || 12) / 12
                                        : sub?.no_of_months || 1;

                                    setDuration(durationValue);

                                    setIsEditOpen(true); // reuse same modal
                                    setButtonType("renew");
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Renew Subscription
                                </DropdownMenuItem>
                              )}
                              {/*  CANCEL (only if subscription exists) */}
                              {subscription.hasSubscription && (
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
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between mt-4">
                  {/* Left info */}
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * rowsPerPage + 1} -{" "}
                    {Math.min(
                      currentPage * rowsPerPage,
                      filteredSubscriptions.length,
                    )}{" "}
                    of {filteredSubscriptions.length}
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Prev
                    </Button>

                    <span className="text-sm px-2 py-1">
                      {currentPage} / {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
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
                <Button
                  onClick={() => setIsDetailOpen(false)}
                  variant="outline"
                  className="flex-1 rounded-lg"
                >
                  Close
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
                  // onChange={(e) => {
                  //   setBillingType(e.target.value);
                  //   setDuration(1);
                  // }}
                  onChange={(e) => {
                    const newType = e.target.value;

                    setBillingType(newType);
                    setDuration(1);

                    const filtered = tiers.filter(
                      (t) => t.billing_cycle === newType,
                    );

                    if (filtered.length > 0) {
                      setEditFormData((prev) => ({
                        ...prev,
                        plan: filtered[0].tier_id,
                      }));
                    }
                  }}
                  disabled={isTrialPlan}
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
                  {tiers
                    .filter((tier) => tier.billing_cycle === billingType)
                    .map((tier) => (
                      <option key={tier.tier_id} value={tier.tier_id}>
                        {tier.name} ( ₹{tier.price}/
                        {billingType === "monthly" ? "mo" : "yr"} )
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
                  onClick={handleUpdateSubscription}
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
                  onClick={handleCancelSubscriptionApi}
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
                  // onChange={(e) => {
                  //   setBillingType(e.target.value);
                  //   setDuration(1);
                  // }}
                  onChange={(e) => {
                    const newType = e.target.value;

                    setBillingType(newType);
                    setDuration(1);

                    const filtered = tiers.filter(
                      (t) => t.billing_cycle === newType,
                    );

                    if (filtered.length > 0) {
                      setEditFormData((prev) => ({
                        ...prev,
                        plan: filtered[0].tier_id,
                      }));
                    }
                  }}
                  disabled={isTrialPlan}
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
                  {tiers
                    .filter((tier) => tier.billing_cycle === billingType)
                    .map((tier) => (
                      <option key={tier.tier_id} value={tier.tier_id}>
                        {tier.name} ( ₹{tier.price}/
                        {billingType === "monthly" ? "mo" : "yr"} )
                      </option>
                    ))}
                </select>
              </div>

              {/* Duration */}
              {isTrialPlan ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">Trial Duration</p>
                  <p className="text-lg font-semibold text-blue-900">
                    7 Days Free Trial
                  </p>
                </div>
              ) : (
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
              )}

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
                  onClick={handleCreateSubscription}
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
