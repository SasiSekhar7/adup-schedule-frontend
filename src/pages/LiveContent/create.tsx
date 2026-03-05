import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Globe, Video, Monitor, Play } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/api";

interface LiveContentForm {
  name: string;
  content_type:
    | "streaming"
    | "website"
    | "iframe"
    | "youtube"
    | "custom"
    | "provider";
  url: string;
  duration: number;
  start_time: string;
  end_time: string;
  channel_id?: string;
  config: {
    autoplay: boolean;
    mute: boolean;
    loop: boolean;
  };
}

export default function CreateLiveContent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LiveContentForm>({
    name: "",
    content_type: "website",
    url: "",
    duration: 0,
    start_time: "",
    end_time: "",
    config: {
      autoplay: false,
      mute: false,
      loop: false,
    },
  });

  const [channels, setChannels] = useState<any[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchLiveContentData();
    }
  }, [id]);

  useEffect(() => {
    if (formData.content_type === "provider") {
      fetchDacastChannels();
    }
  }, [formData.content_type]);

  const fetchDacastChannels = async () => {
    try {
      setLoadingChannels(true);
      const response = await api.get("/streaming/channel");
      setChannels(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch Dacast channels");
    } finally {
      setLoadingChannels(false);
    }
  };

  const fetchLiveContentData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await api.get(`/live-content/${id}`);
      const content = response.data;

      setFormData({
        name: content.name,
        content_type: content.content_type,
        url: content.url,
        duration: content.duration,
        start_time: content.start_time
          ? content.start_time.split("T")[0] +
            "T" +
            content.start_time.split("T")[1].slice(0, 5)
          : "",
        end_time: content.end_time
          ? content.end_time.split("T")[0] +
            "T" +
            content.end_time.split("T")[1].slice(0, 5)
          : "",
        config: {
          autoplay: content.config?.autoplay || false,
          mute: content.config?.mute || false,
          loop: content.config?.loop || false,
        },
      });
    } catch (error) {
      console.error("Error fetching live content:", error);
      toast.error("Failed to fetch live content data");
      navigate("/live-content");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LiveContentForm, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfigChange = (
    field: keyof LiveContentForm["config"],
    value: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    if (!formData.url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        content_type: formData.content_type,
        channel_id: formData.content_type === "provider" ? formData.channel_id : undefined,
        url: formData.url,
        duration: formData.duration,
        start_time: formData.start_time
          ? new Date(formData.start_time).toISOString()
          : undefined,
        end_time: formData.end_time
          ? new Date(formData.end_time).toISOString()
          : undefined,
        config: formData.config,
      };

      if (isEdit) {
        await api.put(`/live-content/${id}`, payload);
        toast.success("Live content updated successfully");
      } else {
        await api.post("/live-content/create", payload);
        toast.success("Live content created successfully");
      }

      navigate("/live-content");
    } catch (error) {
      console.error("Error saving live content:", error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} live content`);
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "streaming":
        return <Video className="h-4 w-4" />;
      case "website":
        return <Globe className="h-4 w-4" />;
      case "iframe":
        return <Monitor className="h-4 w-4" />;
      case "youtube":
        return <Play className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getContentTypeDescription = (type: string) => {
    switch (type) {
      case "streaming":
        return "Live video stream (RTMP, HLS, etc.)";
      case "website":
        return "Full webpage display";
      case "iframe":
        return "Embedded iframe content";
      case "youtube":
        return "YouTube video or live stream";
      case "custom":
        return "Custom content type";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/live-content")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {isEdit ? "Edit Live Content" : "Create Live Content"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update your live content configuration"
              : "Create new live streaming or dynamic content"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Content Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter content name"
                />
              </div>

              <div>
                <Label htmlFor="content_type">Content Type</Label>
                <Select
                  value={formData.content_type}
                  onValueChange={(value) =>
                    handleInputChange("content_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="streaming">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Streaming</p>
                          <p className="text-xs text-muted-foreground">
                            Live video stream
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="website">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Website</p>
                          <p className="text-xs text-muted-foreground">
                            Full webpage display
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="iframe">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <div>
                          <p className="font-medium">iFrame</p>
                          <p className="text-xs text-muted-foreground">
                            Embedded content
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="youtube">
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        <div>
                          <p className="font-medium">YouTube</p>
                          <p className="text-xs text-muted-foreground">
                            YouTube video/stream
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="custom">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Custom</p>
                          <p className="text-xs text-muted-foreground">
                            Custom content type
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  <SelectItem value="provider">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Dacast</p>
                        <p className="text-xs text-muted-foreground">
                          Dacast live channel
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {getContentTypeDescription(formData.content_type)}
                </p>
              </div>

              {/* <div>
                <Label htmlFor="url">Content URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange("url", e.target.value)}
                  placeholder="https://example.com/stream"
                  type="url"
                />
              </div> */}

              {formData.content_type !== "provider" && (
                <div>
                  <Label htmlFor="url">Content URL</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => handleInputChange("url", e.target.value)}
                    placeholder="https://example.com/stream"
                    type="url"
                  />
                </div>
              )}

              {formData.content_type === "provider" && (
                <div>
                  <Label>Select Dacast Channel</Label>
                  <Select
                    onValueChange={(value) => {
                      const selectedChannel = channels.find(
                        (c) => c.channel_id === value,
                      );

                      setFormData((prev) => ({
                        ...prev,
                        channel_id: value,
                        url: selectedChannel?.playback_url || "",
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map((channel) => (
                        <SelectItem
                          key={channel.channel_id}
                          value={channel.channel_id}
                        >
                          {channel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    handleInputChange("duration", parseInt(e.target.value) || 0)
                  }
                  placeholder="0 for indefinite"
                  min="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Set to 0 for indefinite duration
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) =>
                    handleInputChange("start_time", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) =>
                    handleInputChange("end_time", e.target.value)
                  }
                  min={formData.start_time}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Playback Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autoplay</Label>
                  <p className="text-xs text-muted-foreground">
                    Start playing automatically when displayed
                  </p>
                </div>
                <Switch
                  checked={formData.config.autoplay}
                  onCheckedChange={(checked) =>
                    handleConfigChange("autoplay", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mute</Label>
                  <p className="text-xs text-muted-foreground">
                    Start with audio muted
                  </p>
                </div>
                <Switch
                  checked={formData.config.mute}
                  onCheckedChange={(checked) =>
                    handleConfigChange("mute", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Loop</Label>
                  <p className="text-xs text-muted-foreground">
                    Repeat content continuously
                  </p>
                </div>
                <Switch
                  checked={formData.config.loop}
                  onCheckedChange={(checked) =>
                    handleConfigChange("loop", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {getContentTypeIcon(formData.content_type)}
                <span className="font-medium capitalize">
                  {formData.content_type}
                </span>
              </div>

              {formData.url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">URL:</p>
                  <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                    {formData.url}
                  </p>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">
                  {formData.duration === 0
                    ? "Indefinite"
                    : `${formData.duration}s`}
                </span>
              </div>

              {(formData.start_time || formData.end_time) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Schedule:
                  </p>
                  <div className="text-xs space-y-1">
                    {formData.start_time && (
                      <p>
                        Start: {new Date(formData.start_time).toLocaleString()}
                      </p>
                    )}
                    {formData.end_time && (
                      <p>End: {new Date(formData.end_time).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              )}

              {(formData.config.autoplay ||
                formData.config.mute ||
                formData.config.loop) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Config:</p>
                  <div className="flex gap-1 flex-wrap">
                    {formData.config.autoplay && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Autoplay
                      </span>
                    )}
                    {formData.config.mute && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Muted
                      </span>
                    )}
                    {formData.config.loop && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Loop
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button
                  onClick={handleSubmit}
                  disabled={
                    loading || !formData.name.trim() || !formData.url.trim()
                  }
                  className="w-full"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEdit ? "Updating..." : "Creating..."}
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEdit ? "Update Live Content" : "Create Live Content"}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/live-content")}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
