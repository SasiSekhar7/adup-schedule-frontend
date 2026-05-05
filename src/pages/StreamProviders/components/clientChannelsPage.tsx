import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  MoreHorizontal,
  Search,
  Play,
  Square,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import api from "@/api";
import { toast } from "sonner";

export default function ClientChannelsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const navigate = useNavigate();

  const [allchannels, setAllChannels] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      fetchChannels();
    };

    loadData();
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await api.get(`/streaming/client-channel`);
      console.log("Channels:", res.data);

      setAllChannels(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredChannels = allchannels.filter((channel) => {
    const matchesSearch = channel.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || channel.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleToggleLive = async (channel: any) => {
    try {
      if (!channel) return;
      setActionLoading(channel.channel_id);

      if (channel.status === "live") {
        // STOP STREAM
        await api.put(`/streaming/channel/${channel.channel_id}/stop`);
        await fetchChannels();
      } else {
        // START STREAM
        await api.put(`/streaming/channel/${channel.channel_id}/start`);
        await fetchChannels();
      }
    } catch (error) {
      console.error("Failed to toggle stream:", error);
      toast.error(error?.error || "Something went wrong ❌");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Streaming Channels
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your live streaming channels
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-[300px] md:w-full">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search channels..."
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 ">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-card">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="live">Live</SelectItem>

                <SelectItem value="idle">Idle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredChannels.length == 0 ? (
          <p className="text-muted-foreground">No Channels available.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredChannels.map((channel) => (
              <button
                key={channel.channel_id}
                className="group relative max-w-[300px] md:max-w-md flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-foreground/20 text-left"
              >
                <div
                  className="p-5"
                  onClick={() =>
                    navigate(`/channel-details/${channel.channel_id}`)
                  }
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-foreground">
                      {channel.name}
                    </h3>
                    <MoreHorizontal className="size-4 text-muted-foreground" />
                  </div>

                  {/* STATUS */}
                  <div className="mt-2 flex items-center gap-2">
                    {channel.status === "live" ? (
                      <Badge className="bg-emerald-600 text-primary-foreground border-0 text-[11px]">
                        <span className="mr-1 inline-block size-1.5 rounded-full bg-primary-foreground animate-pulse" />
                        live
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-[11px] text-muted-foreground"
                      >
                        {channel.status}
                      </Badge>
                    )}

                    {/* <Badge className="bg-red-50 text-red-600 border-0 text-[11px]">
                    streaming
                  </Badge> */}
                  </div>

                  {/* URL */}
                  <div className="mt-4">
                    <span className="text-xs text-muted-foreground">
                      Playback URL:
                    </span>
                    <div className="mt-1 rounded-md bg-muted px-2.5 py-1.5">
                      <p className="truncate text-xs text-foreground font-mono">
                        {channel.playback_url}
                      </p>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="border-t px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    Created: {new Date(channel.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {channel && (
                      <Button
                        size="sm"
                        disabled={actionLoading === channel.channel_id}
                        variant={
                          channel.status === "live" ? "destructive" : "default"
                        }
                        className={`h-7 gap-1.5 text-xs ${
                          channel.status === "live"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                        onClick={() => handleToggleLive(channel)}
                      >
                        {actionLoading === channel.channel_id ? (
                          "Loading..."
                        ) : channel.status === "live" ? (
                          <>
                            <Square className="size-3" />
                            Stop Live
                          </>
                        ) : (
                          <>
                            <Play className="size-3" />
                            Go Live
                          </>
                        )}
                      </Button>
                    )}

                    <ChevronRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* <ChevronRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" /> */}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
