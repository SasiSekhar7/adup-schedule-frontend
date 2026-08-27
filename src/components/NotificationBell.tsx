import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Shield,
  Monitor,
  Calendar,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/api";
import { formatDistanceToNow } from "date-fns";
import { listenForegroundNotifications } from "@/lib/firebase";

export interface NotificationItem {
  notification_id?: string;
  id?: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch notifications ONLY from backend database API for current logged in user
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res: any = await api.get("/notifications/list", {
        params: { limit: 30 },
      });
      if (res && res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn("Failed to fetch notification history from DB:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // When an FCM message arrives in foreground, re-fetch live DB notifications
    const unsubscribe = listenForegroundNotifications(() => {
      fetchNotifications();
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Mark single notification as read in DB
  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    try {
      setNotifications((prev) =>
        prev.map((n) =>
          (n.notification_id || n.id) === id ? { ...n, is_read: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await api.patch(`/notifications/${id}/read`);
    } catch (err) {
      console.warn("Failed to mark notification as read:", err);
    }
  };

  // Mark all as read in DB
  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      await api.post("/notifications/mark-all-read");
    } catch (err) {
      console.warn("Failed to mark all notifications as read:", err);
    }
  };

  // Delete single notification permanently from DB
  const handleDeleteSingle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    try {
      const targetItem = notifications.find(
        (n) => (n.notification_id || n.id) === id,
      );
      setNotifications((prev) =>
        prev.filter((n) => (n.notification_id || n.id) !== id),
      );
      if (targetItem && !targetItem.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      await api.delete(`/notifications/${id}`);
    } catch (err) {
      console.warn("Failed to delete notification permanently:", err);
      fetchNotifications();
    }
  };

  // Clear all notifications permanently from DB
  const handleClearAll = async () => {
    try {
      setNotifications([]);
      setUnreadCount(0);
      await api.delete("/notifications/clear-all");
    } catch (err) {
      console.warn("Failed to clear all notifications from DB:", err);
      fetchNotifications();
    }
  };

  // Icon selector based on type
  const getNotificationIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case "LOGIN_SUCCESS":
      case "SECURITY":
        return <Shield className="w-4 h-4 text-blue-500" />;
      case "DEVICE_OFFLINE":
      case "DEVICE_ONLINE":
        return <Monitor className="w-4 h-4 text-purple-500" />;
      case "SCHEDULE_ALERT":
      case "CAMPAIGN":
        return <Calendar className="w-4 h-4 text-emerald-500" />;
      case "ALERT":
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-sky-500" />;
    }
  };

  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-accent transition-colors"
          aria-label="Open notifications"
        >
          <Bell className="w-5 h-5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-0 shadow-2xl rounded-2xl border border-border bg-card overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-sm text-foreground">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium"
              >
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
                title="Mark all read"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">Read all</span>
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 h-7 px-2"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                <span>Clear all</span>
              </Button>
            )}
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-border bg-muted/10 text-xs font-medium">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-2 text-center transition-colors border-b-2 ${
              activeTab === "all"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`flex-1 py-2 text-center transition-colors border-b-2 ${
              activeTab === "unread"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notification List */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-border">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                No notifications found
              </p>
              <p className="text-xs text-muted-foreground">
                All database notifications are clear!
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const notifId = (item.notification_id || item.id) as string;
              return (
                <div
                  key={notifId}
                  onClick={(e) => !item.is_read && handleMarkAsRead(notifId, e)}
                  className={`group flex items-start gap-3 p-3 text-left transition-colors cursor-pointer hover:bg-muted/50 ${
                    !item.is_read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                  }`}
                >
                  {/* Type Icon */}
                  <div className="p-2 rounded-xl bg-card border border-border shadow-sm shrink-0 mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <p
                        className={`text-xs font-semibold truncate ${!item.is_read ? "text-foreground font-bold" : "text-muted-foreground"}`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0 flex items-center">
                        <Clock className="w-2.5 h-2.5 mr-0.5 inline" />
                        {item.created_at
                          ? formatDistanceToNow(new Date(item.created_at), {
                              addSuffix: true,
                            })
                          : "Just now"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.body}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-1 shrink-0">
                    {!item.is_read && (
                      <span
                        className="w-2 h-2 rounded-full bg-blue-600 my-auto"
                        title="Unread"
                      ></span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteSingle(notifId, e)}
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
