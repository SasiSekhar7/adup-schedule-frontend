"use client";

import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  Clock,
  ExternalLink,
  MoreHorizontal,
  Search,
  Eye,
  Plus,
  Play,
  Square,
  Trash,
} from "lucide-react";
import {
  getProvider,
  type Channel,
} from "@/pages/StreamProviders/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import api from "@/api";
import { toast } from "sonner";

export default function ProviderChannelsPage() {
  const { slug } = useParams();
  const providerSlug = slug as string;
  //   const { provider: providerSlug } = use(params);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const provider = getProvider(providerSlug);
  //   const router = useRouter();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [channels, setChannels] = useState<Channel[]>(provider?.channels ?? []);
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "streaming" as "streaming" | "website" | "vod",
    resolution: "1920x1080",
    bitrate: "4500",
    fps: "30",
    url: "",
  });

  const [allchannels, setAllChannels] = useState<any[]>([]);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await api.get("/streaming/channel");
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

  const toggleLive = (channelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId
          ? {
              ...ch,
              status: ch.status === "live" ? "active" : "live",
              viewers:
                ch.status === "live" ? 0 : Math.floor(Math.random() * 500) + 10,
            }
          : ch,
      ),
    );
  };

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
    } finally {
      setActionLoading(null);
    }
  };

  const createChannel = async () => {
    try {
      setCreateLoading(true);
      const res = await api.post("/streaming/channel", {
        name: form.name,
        description: form.description,
      });

      console.log("Channel Created:", res.data);

      // optional refresh
      fetchChannels();

      setDialogOpen(false);

      setForm({
        name: "",
        description: "",
        type: "streaming",
        resolution: "1920x1080",
        bitrate: "4500",
        fps: "30",
        url: "",
      });
    } catch (error) {
      toast.error(
        error?.error?.details?.split("\n")[0] ||
          "An unexpected error occurred.",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const deleteChannel = async (channelId: string) => {
    try {
      setDeleteLoading(channelId);
      const res = await api.delete(`/streaming/channel/${channelId}`);

      console.log("Channel Created:", res.data);

      // optional refresh
      await fetchChannels();
    } catch (error) {
      console.error("Failed to create channel:", error);
    } finally {
      setDeleteLoading(null);
    }
  };

  if (!provider) {
    return <div className="p-6">Provider not found</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {provider.name} Channels
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your live streaming channels on {provider.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={provider.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Visit {provider.name}
              <ExternalLink className="size-3" />
            </a>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1.5">
                  <Plus className="size-4" />
                  Create Channel
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>Create New Channel</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to create a new channel on{" "}
                    {provider.name}. You can configure OBS settings after
                    creation.
                  </DialogDescription>
                </DialogHeader>
                <form
                  //   onSubmit={(e) => {
                  //     e.preventDefault();
                  //     const newId = `ch-${Date.now()}`;
                  //     const newChannel: Channel = {
                  //       id: newId,
                  //       name: form.name,
                  //       status: "active",
                  //       type: form.type,
                  //       duration: "Indefinite",
                  //       url:
                  //         form.url ||
                  //         `https://playlist.${providerSlug}.com/live/${newId}.m3u8`,
                  //       rtmpUrl:
                  //         provider.channels[0]?.rtmpUrl ||
                  //         `rtmp://ingest.${providerSlug}.com/live`,
                  //       streamKey: `${newId}-${Math.random().toString(36).slice(2, 10)}`,
                  //       createdAt: new Date().toLocaleDateString("en-US"),
                  //       resolution: form.resolution,
                  //       bitrate: `${form.bitrate} kbps`,
                  //       fps: form.fps,
                  //       viewers: 0,
                  //       config: form.description || "--",
                  //     };
                  //     setChannels((prev) => [...prev, newChannel]);
                  //     setForm({
                  //       name: "",
                  //       description: "",
                  //       type: "streaming",
                  //       resolution: "1920x1080",
                  //       bitrate: "4500",
                  //       fps: "30",
                  //       url: "",
                  //     });
                  //     setDialogOpen(false);
                  //   }}

                  onSubmit={(e) => {
                    e.preventDefault();
                    createChannel();
                  }}
                  className="grid gap-4"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="channel-name">
                      Channel Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="channel-name"
                      placeholder="e.g. My Live Stream"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="channel-desc">Description</Label>
                    <Textarea
                      id="channel-desc"
                      placeholder="Brief description of this channel..."
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  {/* <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="channel-type">Type</Label>
                      <Select
                        value={form.type}
                        onValueChange={(v) =>
                          setForm((f) => ({
                            ...f,
                            type: v as "streaming" | "website" | "vod",
                          }))
                        }
                      >
                        <SelectTrigger id="channel-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="streaming">Streaming</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="vod">VOD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="channel-res">Resolution</Label>
                      <Select
                        value={form.resolution}
                        onValueChange={(v) =>
                          setForm((f) => ({ ...f, resolution: v }))
                        }
                      >
                        <SelectTrigger id="channel-res">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1920x1080">
                            1920x1080 (Full HD)
                          </SelectItem>
                          <SelectItem value="1280x720">
                            1280x720 (HD)
                          </SelectItem>
                          <SelectItem value="854x480">854x480 (SD)</SelectItem>
                          <SelectItem value="3840x2160">
                            3840x2160 (4K)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="channel-bitrate">Bitrate (kbps)</Label>
                      <Input
                        id="channel-bitrate"
                        type="number"
                        placeholder="4500"
                        value={form.bitrate}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, bitrate: e.target.value }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="channel-fps">FPS</Label>
                      <Select
                        value={form.fps}
                        onValueChange={(v) =>
                          setForm((f) => ({ ...f, fps: v }))
                        }
                      >
                        <SelectTrigger id="channel-fps">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24">24 fps</SelectItem>
                          <SelectItem value="30">30 fps</SelectItem>
                          <SelectItem value="60">60 fps</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="channel-url">Stream URL (optional)</Label>
                    <Input
                      id="channel-url"
                      placeholder="https://..."
                      value={form.url}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, url: e.target.value }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to auto-generate a URL from {provider.name}
                    </p>
                  </div> */}
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createLoading}>
                      {createLoading ? "Creating..." : "Create Channel"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search channels..."
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
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
            {/* <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] bg-card">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="streaming">Streaming</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="vod">VOD</SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {/* {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() =>
                navigate(`/stream-providers/${providerSlug}/${channel.id}`)
              }
              className="group relative flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-foreground/20 text-left"
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-foreground">
                    {channel.name}
                  </h3>
                  <MoreHorizontal className="size-4 text-muted-foreground" />
                </div>

                <div className="mt-2 flex items-center gap-2">
                  {channel.status === "live" ? (
                    <Badge className="bg-emerald-600 text-primary-foreground border-0 text-[11px]">
                      <span className="mr-1 inline-block size-1.5 rounded-full bg-primary-foreground animate-pulse" />
                      live
                    </Badge>
                  ) : channel.status === "active" ? (
                    <Badge className="bg-foreground text-primary-foreground border-0 text-[11px]">
                      active
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-[11px] text-muted-foreground"
                    >
                      inactive
                    </Badge>
                  )}
                  {channel.type === "streaming" ? (
                    <Badge className="bg-red-50 text-red-600 border-0 text-[11px]">
                      streaming
                    </Badge>
                  ) : channel.type === "website" ? (
                    <Badge className="bg-muted text-muted-foreground border-0 text-[11px]">
                      website
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-50 text-blue-600 border-0 text-[11px]">
                      vod
                    </Badge>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Duration:</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {channel.duration}
                  </span>
                </div>

                <div className="mt-2">
                  <span className="text-xs text-muted-foreground">URL:</span>
                  <div className="mt-1 rounded-md bg-muted px-2.5 py-1.5">
                    <p className="truncate text-xs text-foreground font-mono">
                      {channel.url}
                    </p>
                  </div>
                </div>

                {channel.viewers > 0 && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="size-3" />
                    {channel.viewers.toLocaleString()} viewers
                  </div>
                )}

                <div className="mt-3 text-xs text-muted-foreground">
                  Config: {channel.config || "--"}
                </div>
              </div>

              <div className="border-t px-5 py-2.5 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Created: {channel.createdAt}
                </span>
                <div className="flex items-center gap-2">
                  {channel.type === "streaming" && (
                    <Button
                      size="sm"
                      variant={
                        channel.status === "live" ? "destructive" : "default"
                      }
                      className={`h-7 gap-1.5 text-xs ${
                        channel.status === "live"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                      onClick={(e) => toggleLive(channel.id, e)}
                    >
                      {channel.status === "live" ? (
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
              </div>
            </button>
          ))} */}
          {filteredChannels.map((channel) => (
            <button
              key={channel.channel_id}
              className="group relative flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-foreground/20 text-left"
            >
              <div
                className="p-5"
                onClick={() =>
                  navigate(
                    `/stream-providers/${providerSlug}/${channel.channel_id}`,
                  )
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
              <div className="border-t px-5 py-2.5 flex items-center justify-between">
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
                  <Button
                    disabled={deleteLoading === channel.channel_id}
                    className="gap-1.5 h-7 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => deleteChannel(channel.channel_id)}
                  >
                    {deleteLoading === channel.channel_id ? (
                      "Deleting..."
                    ) : (
                      <>
                        <Trash className="size-3" />
                        Delete
                      </>
                    )}
                  </Button>
                  <ChevronRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* <ChevronRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" /> */}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
