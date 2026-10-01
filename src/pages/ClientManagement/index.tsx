import api from "@/api";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Users,
  Search,
  MonitorSmartphone,
  Megaphone,
  History,
  Trash2,
  Power,
  CreditCard,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Phone,
  Mail,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface CurrentSubscription {
  subscription_id: string;
  tier_id: string;
  status: string;
  billing_cycle: string;
  no_of_months: number;
  is_trial: boolean;
  start_date: string;
  end_date: string;
  Tier?: {
    name: string;
    description?: string;
    price?: number;
    billing_cycle?: string;
  };
}

interface ClientData {
  client_id: string;
  name: string;
  email: string;
  phone_number: string | number;
  subscription_status: string;
  is_active: boolean;
  is_suspended: boolean;
  suspended_at?: string | null;
  suspended_reason?: string | null;
  is_deleted?: boolean;
  used_storage_bytes: string;
  createdAt: string;
  currentSubscription?: CurrentSubscription | null;
  devices_summary: {
    total_devices: number;
    active_devices_24h: number;
  };
  total_ads: number;
}

interface SubscriptionHistoryItem {
  subscription_id: string;
  tier_id: string;
  status: string;
  billing_cycle: string;
  no_of_months: number;
  is_trial: boolean;
  start_date: string;
  end_date: string;
  createdAt?: string;
  Tier?: {
    name: string;
    price?: number;
    billing_cycle?: string;
  };
}

type SortField = "name" | "email" | "createdAt" | "subscription" | "devices" | "ads";
type SortOrder = "asc" | "desc";

export default function ClientManagement() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Sorting State
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Server-Side Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Suspend Modal State
  const [suspendModalOpen, setSuspendModalOpen] = useState<boolean>(false);
  const [clientToSuspend, setClientToSuspend] = useState<ClientData | null>(null);
  const [suspendedReasonInput, setSuspendedReasonInput] = useState<string>("");
  const [suspendLoading, setSuspendLoading] = useState<boolean>(false);

  // History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<ClientData | null>(null);
  const [historyList, setHistoryList] = useState<SubscriptionHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [clientToDelete, setClientToDelete] = useState<ClientData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Status Action Loading
  const [updatingClientId, setUpdatingClientId] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res: any = await api.get("/client-management/all", {
        params: {
          page: currentPage,
          limit: pageSize,
          search: debouncedSearchTerm.trim(),
          status: statusFilter,
          sortBy: sortField,
          sortOrder: sortOrder,
        },
      });

      if (res?.data) {
        setClients(res.data);
      } else if (Array.isArray(res)) {
        setClients(res);
      }

      if (res?.pagination) {
        setTotalRecords(res.pagination.totalRecords || 0);
        setTotalPages(res.pagination.totalPages || 1);
      } else {
        setTotalRecords(res?.data?.length || 0);
        setTotalPages(1);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  // Fetch when page, pageSize, debounced search, status, or sorting changes
  useEffect(() => {
    fetchClients();
  }, [currentPage, pageSize, debouncedSearchTerm, statusFilter, sortField, sortOrder]);

  const formatPhone = (num: any) => {
    if (!num) return "";
    return String(num).replace(/\.0$/, "");
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleOpenSuspendModal = (client: ClientData) => {
    setClientToSuspend(client);
    setSuspendedReasonInput("");
    setSuspendModalOpen(true);
  };

  const handleConfirmSuspend = async () => {
    if (!clientToSuspend) return;
    if (!suspendedReasonInput.trim()) {
      toast.error("Please enter a reason for suspending the client account.");
      return;
    }

    try {
      setSuspendLoading(true);
      await api.patch(`/client-management/${clientToSuspend.client_id}/status`, {
        is_suspended: true,
        suspended_reason: suspendedReasonInput.trim(),
      });
      toast.success(`Client ${clientToSuspend.name} has been suspended.`);
      setSuspendModalOpen(false);
      setClientToSuspend(null);
      await fetchClients();
    } catch (err: any) {
      toast.error(err?.message || "Failed to suspend client");
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleUnsuspendClient = async (client: ClientData) => {
    try {
      setUpdatingClientId(client.client_id);
      await api.patch(`/client-management/${client.client_id}/status`, {
        is_suspended: false,
      });
      toast.success(`Client ${client.name} has been unsuspended/activated.`);
      await fetchClients();
    } catch (err: any) {
      toast.error(err?.message || "Failed to unsuspend client");
    } finally {
      setUpdatingClientId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/client-management/${clientToDelete.client_id}`);
      toast.success("Client deleted successfully");
      setDeleteModalOpen(false);
      setClientToDelete(null);
      await fetchClients();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete client");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenHistory = async (client: ClientData) => {
    setSelectedClientForHistory(client);
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res: any = await api.get(
        `/client-management/${client.client_id}/subscription-history`,
      );
      if (res?.data) {
        setHistoryList(res.data);
      } else if (Array.isArray(res)) {
        setHistoryList(res);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load subscription history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);

  const activeClientsCount = clients.filter((c) => !c.is_suspended).length;
  const suspendedClientsCount = clients.filter((c) => c.is_suspended).length;
  const totalActiveDevices = clients.reduce(
    (acc, c) => acc + (c.devices_summary?.active_devices_24h || 0),
    0,
  );
  const totalAds = clients.reduce((acc, c) => acc + (c.total_ads || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200";
      case "trial":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200";
      case "scheduled":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200";
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-muted-foreground/60" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 ml-1 text-primary" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 ml-1 text-primary" />
    );
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-full p-3 sm:p-4 md:p-6 mx-auto">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Client Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage client accounts, account suspensions, fleet activity, and subscription plans.
          </p>
        </div>
        <Button onClick={fetchClients} variant="outline" size="sm" className="gap-2 self-start sm:self-auto">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Total Records (Query)
            </CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl sm:text-2xl font-bold">{totalRecords}</div>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Active / Suspended (Page)
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl sm:text-2xl font-bold">
              <span className="text-green-600">{activeClientsCount}</span>
              <span className="text-muted-foreground text-xs sm:text-sm font-normal"> Act</span>
              {" / "}
              <span className="text-red-600">{suspendedClientsCount}</span>
              <span className="text-muted-foreground text-xs sm:text-sm font-normal"> Susp</span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Active Devices (24h)
            </CardTitle>
            <MonitorSmartphone className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl sm:text-2xl font-bold">{totalActiveDevices}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Synced in last 24h</p>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-4">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Total Ads Uploaded
            </CardTitle>
            <Megaphone className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-xl sm:text-2xl font-bold">{totalAds}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => {
                setStatusFilter("all");
                setCurrentPage(1);
              }}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => {
                setStatusFilter("active");
                setCurrentPage(1);
              }}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "suspended" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => {
                setStatusFilter("suspended");
                setCurrentPage(1);
              }}
            >
              Suspended
            </Button>
          </div>

          {/* Quick Sort Dropdown */}
          <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
            <span className="text-xs text-muted-foreground hidden sm:inline">Sort:</span>
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split("-");
                setSortField(f as SortField);
                setSortOrder(o as SortOrder);
                setCurrentPage(1);
              }}
              className="h-8 text-xs px-2 rounded-md border bg-background text-foreground"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name (A - Z)</option>
              <option value="name-desc">Name (Z - A)</option>
              <option value="devices-desc">Most Active Devices</option>
              <option value="ads-desc">Most Ads</option>
            </select>
          </div>
        </div>
      </div>

      {/* MOBILE CLIENT CARDS VIEW (< 768px) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <Card className="p-6 text-center text-xs text-muted-foreground">
            Loading clients from server...
          </Card>
        ) : clients.length === 0 ? (
          <Card className="p-6 text-center text-xs text-muted-foreground">
            No clients found.
          </Card>
        ) : (
          clients.map((client) => {
            const sub = client.currentSubscription;
            const activeCount = client.devices_summary?.active_devices_24h || 0;
            const totalCount = client.devices_summary?.total_devices || 0;
            const phoneStr = formatPhone(client.phone_number);

            return (
              <Card key={client.client_id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{client.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 inline" /> {client.email}
                    </p>
                    {phoneStr && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 inline" /> {phoneStr}
                      </p>
                    )}
                  </div>
                  <div>
                    {client.is_suspended ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                        <AlertTriangle className="w-3 h-3" /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                </div>

                {client.is_suspended && client.suspended_reason && (
                  <div className="text-xs bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 p-2 rounded border border-red-200">
                    <span className="font-semibold">Reason:</span> {client.suspended_reason}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-2.5 rounded-md">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Subscription</span>
                    {sub ? (
                      <span className="font-medium text-foreground">
                        {sub.Tier?.name} ({sub.status})
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">No Plan</span>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Devices Fleet</span>
                    <span className="font-medium text-foreground">
                      {activeCount} / {totalCount} Active (24h)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs flex-1 gap-1"
                    onClick={() => handleOpenHistory(client)}
                  >
                    <History className="w-3.5 h-3.5" /> History
                  </Button>

                  {client.is_suspended ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs flex-1 gap-1"
                      disabled={updatingClientId === client.client_id}
                      onClick={() => handleUnsuspendClient(client)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Unsuspend
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs flex-1 gap-1"
                      disabled={updatingClientId === client.client_id}
                      onClick={() => handleOpenSuspendModal(client)}
                    >
                      <Power className="w-3.5 h-3.5 text-red-500" /> Suspend
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 px-2.5"
                    onClick={() => {
                      setClientToDelete(client);
                      setDeleteModalOpen(true);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* DESKTOP / TABLET DATA TABLE VIEW (>= 768px) */}
      <Card className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b text-xs uppercase tracking-wider select-none">
              <tr>
                {/* Sortable Header: Client */}
                <th
                  className="p-3.5 pl-4 cursor-pointer hover:bg-muted/80 transition-colors whitespace-nowrap"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Client {renderSortIcon("name")}
                  </div>
                </th>

                <th className="p-3.5 whitespace-nowrap">Account Status</th>

                {/* Sortable Header: Subscription */}
                <th
                  className="p-3.5 cursor-pointer hover:bg-muted/80 transition-colors whitespace-nowrap"
                  onClick={() => handleSort("subscription")}
                >
                  <div className="flex items-center">
                    Subscription {renderSortIcon("subscription")}
                  </div>
                </th>

                {/* Sortable Header: Devices */}
                <th
                  className="p-3.5 cursor-pointer hover:bg-muted/80 transition-colors whitespace-nowrap"
                  onClick={() => handleSort("devices")}
                >
                  <div className="flex items-center">
                    Devices (Active / Total) {renderSortIcon("devices")}
                  </div>
                </th>

                {/* Sortable Header: Total Ads */}
                <th
                  className="p-3.5 cursor-pointer hover:bg-muted/80 transition-colors whitespace-nowrap"
                  onClick={() => handleSort("ads")}
                >
                  <div className="flex items-center">
                    Total Ads {renderSortIcon("ads")}
                  </div>
                </th>

                <th className="p-3.5 pr-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
                    Loading client management data...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
                    No clients found matching criteria.
                  </td>
                </tr>
              ) : (
                clients.map((client) => {
                  const sub = client.currentSubscription;
                  const activeCount = client.devices_summary?.active_devices_24h || 0;
                  const totalCount = client.devices_summary?.total_devices || 0;
                  const phoneStr = formatPhone(client.phone_number);

                  return (
                    <tr key={client.client_id} className="hover:bg-muted/30 transition-colors">
                      {/* Client Info */}
                      <td className="p-3.5 pl-4 align-top">
                        <div className="font-semibold text-foreground leading-snug">{client.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{client.email}</div>
                        {phoneStr && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            📞 {phoneStr}
                          </div>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="p-3.5 align-top">
                        {client.is_suspended ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200">
                              <AlertTriangle className="w-3 h-3" /> Suspended
                            </span>
                            {client.suspended_reason && (
                              <div className="text-[11px] text-red-600 dark:text-red-400 font-medium max-w-[180px] leading-tight" title={client.suspended_reason}>
                                Reason: {client.suspended_reason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>

                      {/* Subscription Info */}
                      <td className="p-3.5 align-top">
                        {sub ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-medium text-foreground">{sub.Tier?.name || "Tier"}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusBadge(
                                  sub.status,
                                )}`}
                              >
                                {sub.status}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Exp: {new Date(sub.end_date).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            No Active Subscription
                          </span>
                        )}
                      </td>

                      {/* Devices Fleet */}
                      <td className="p-3.5 align-top whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/60 rounded-md text-xs font-medium border">
                          <span
                            className={
                              activeCount > 0 ? "text-green-600 font-bold dark:text-green-400" : "text-gray-500"
                            }
                          >
                            {activeCount}
                          </span>
                          <span className="text-muted-foreground">/</span>
                          <span>{totalCount} Active (24h)</span>
                        </div>
                      </td>

                      {/* Total Ads */}
                      <td className="p-3.5 align-top whitespace-nowrap">
                        <span className="font-semibold text-foreground">{client.total_ads}</span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* History Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs px-2.5"
                            onClick={() => handleOpenHistory(client)}
                            title="View Subscription History"
                          >
                            <History className="w-3.5 h-3.5 mr-1" />
                            History
                          </Button>

                          {/* Suspend / Unsuspend Button */}
                          {client.is_suspended ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 text-xs px-2.5"
                              disabled={updatingClientId === client.client_id}
                              onClick={() => handleUnsuspendClient(client)}
                              title="Unsuspend/Activate Client"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-600" />
                              Unsuspend
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 text-xs px-2.5"
                              disabled={updatingClientId === client.client_id}
                              onClick={() => handleOpenSuspendModal(client)}
                              title="Suspend Client Account"
                            >
                              <Power className="w-3.5 h-3.5 mr-1 text-red-500" />
                              Suspend
                            </Button>
                          )}

                          {/* Delete Button */}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setClientToDelete(client);
                              setDeleteModalOpen(true);
                            }}
                            title="Delete Client"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 📄 SERVER-SIDE PAGINATION CONTROLS BAR */}
      {totalRecords > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-card border rounded-lg text-xs text-muted-foreground">
          {/* Info text */}
          <div>
            Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{" "}
            <span className="font-semibold text-foreground">{endIndex}</span> of{" "}
            <span className="font-semibold text-foreground">{totalRecords}</span> entries
          </div>

          {/* Page size & Controls */}
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap justify-center">
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-7 text-xs px-1.5 rounded border bg-background text-foreground"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Pagination Navigation Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>

              <span className="px-2 font-medium text-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="Last Page"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ SUSPEND CLIENT MODAL */}
      <Dialog open={suspendModalOpen} onOpenChange={setSuspendModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Suspend Client Account
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Suspending this client will immediately restrict all users under{" "}
              <strong className="text-foreground">{clientToSuspend?.name}</strong> from logging into the platform.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Reason for Suspension <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="e.g. Non-payment of subscription invoice / Violation of terms of service..."
                value={suspendedReasonInput}
                onChange={(e) => setSuspendedReasonInput(e.target.value)}
                rows={3}
                className="text-xs sm:text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setSuspendModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={suspendLoading}
              onClick={handleConfirmSuspend}
            >
              {suspendLoading ? "Suspending..." : "Confirm Suspension"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 📜 SUBSCRIPTION HISTORY MODAL */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="max-w-xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Subscription History: {selectedClientForHistory?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto space-y-3 my-2 pr-1">
            {historyLoading ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Loading subscription trajectory...
              </div>
            ) : historyList.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No subscription history recorded for this client.
              </div>
            ) : (
              <div className="space-y-3">
                {historyList.map((item, idx) => (
                  <div
                    key={item.subscription_id || idx}
                    className="p-3 border rounded-lg bg-card hover:bg-muted/20 transition-colors text-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-sm text-foreground">
                        {item.Tier?.name || "Subscription Plan"}
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-semibold text-foreground">Billing:</span>{" "}
                        {item.billing_cycle || "N/A"} ({item.no_of_months} month
                        {item.no_of_months > 1 ? "s" : ""})
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Trial:</span>{" "}
                        {item.is_trial ? "Yes" : "No"}
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Start Date:</span>{" "}
                        {new Date(item.start_date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">End Date:</span>{" "}
                        {new Date(item.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setHistoryModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🗑️ DELETE CONFIRMATION MODAL */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Client Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-xs sm:text-sm text-muted-foreground my-2">
            Are you sure you want to delete client{" "}
            <strong className="text-foreground">{clientToDelete?.name}</strong>?
            This will soft-delete the client from management.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteLoading}
              onClick={handleConfirmDelete}
            >
              {deleteLoading ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
