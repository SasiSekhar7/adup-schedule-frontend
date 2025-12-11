import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  MoreHorizontal,
  Search,
  ExternalLink,
  Clock,
  Globe,
  Video,
  Monitor
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/api";
import { useNavigate } from "react-router-dom";

interface LiveContent {
  live_content_id: string;
  name: string;
  content_type: "streaming" | "website" | "iframe" | "youtube" | "custom";
  url: string;
  duration: number;
  start_time?: string;
  end_time?: string;
  status: "active" | "inactive";
  config: {
    autoplay?: boolean;
    mute?: boolean;
    loop?: boolean;
  };
  Client: {
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface LiveContentResponse {
  data: LiveContent[];
}

export default function LiveContent() {
  const [liveContents, setLiveContents] = useState<LiveContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchLiveContents();
  }, []);

  const fetchLiveContents = async () => {
    try {
      setLoading(true);
      const response = await api.get<LiveContentResponse>("/live-content/all");
      setLiveContents(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error fetching live contents:", error);
      toast.error("Failed to fetch live contents");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLiveContent = async (liveContentId: string) => {
    if (!confirm("Are you sure you want to delete this live content?")) return;
    
    try {
      await api.delete(`/live-content/${liveContentId}`);
      toast.success("Live content deleted successfully");
      fetchLiveContents();
    } catch (error) {
      console.error("Error deleting live content:", error);
      toast.error("Failed to delete live content");
    }
  };

  const handleToggleStatus = async (liveContent: LiveContent) => {
    try {
      const newStatus = liveContent.status === "active" ? "inactive" : "active";
      await api.put(`/live-content/${liveContent.live_content_id}`, { status: newStatus });
      toast.success(`Live content ${newStatus === "active" ? "activated" : "deactivated"}`);
      fetchLiveContents();
    } catch (error) {
      console.error("Error updating live content status:", error);
      toast.error("Failed to update live content status");
    }
  };

  const filteredLiveContents = liveContents.filter((content) => {
    const matchesSearch = content.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || content.status === statusFilter;
    const matchesType = typeFilter === "all" || content.content_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

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

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "streaming":
        return "bg-red-100 text-red-800";
      case "website":
        return "bg-blue-100 text-blue-800";
      case "iframe":
        return "bg-green-100 text-green-800";
      case "youtube":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "Indefinite";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading live contents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Live Content</h1>
          <p className="text-muted-foreground">
            Manage your live streaming and dynamic content
          </p>
        </div>
        <Button onClick={() => navigate("/live-content/add")} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Create Live Content
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search live content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="streaming">Streaming</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="iframe">iFrame</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Live Content Grid */}
      {filteredLiveContents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No live content found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first live content to get started"}
              </p>
              {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
                <Button onClick={() => navigate("/live-content/add")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Live Content
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLiveContents.map((content) => (
            <Card key={content.live_content_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{content.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={content.status === "active" ? "default" : "secondary"}>
                        {content.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`${getContentTypeColor(content.content_type)} border-0`}
                      >
                        <span className="flex items-center gap-1">
                          {getContentTypeIcon(content.content_type)}
                          {content.content_type}
                        </span>
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/live-content/${content.live_content_id}`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(content.url, '_blank')}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open URL
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(content)}>
                        {content.status === "active" ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteLiveContent(content.live_content_id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(content.duration)}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">URL:</p>
                    <p className="text-xs font-mono bg-muted p-2 rounded truncate">
                      {content.url}
                    </p>
                  </div>

                  {(content.start_time || content.end_time) && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Schedule:</p>
                      <div className="text-xs space-y-1">
                        {content.start_time && (
                          <p>Start: {new Date(content.start_time).toLocaleString()}</p>
                        )}
                        {content.end_time && (
                          <p>End: {new Date(content.end_time).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {Object.keys(content.config || {}).length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Config:</p>
                      <div className="flex gap-1 flex-wrap">
                        {content.config.autoplay && (
                          <Badge variant="outline" className="text-xs">Autoplay</Badge>
                        )}
                        {content.config.mute && (
                          <Badge variant="outline" className="text-xs">Muted</Badge>
                        )}
                        {content.config.loop && (
                          <Badge variant="outline" className="text-xs">Loop</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(content.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
