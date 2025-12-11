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
  Search
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

interface CarouselItem {
  carousel_item_id: string;
  display_order: number;
  Ad: {
    ad_id: string;
    name: string;
    url: string;
    duration: number;
    status: string;
  };
}

interface Carousel {
  carousel_id: string;
  name: string;
  status: "active" | "inactive";
  total_duration: number;
  Client: {
    name: string;
  };
  items: CarouselItem[];
  created_at: string;
  updated_at: string;
}

interface CarouselsResponse {
  data: Carousel[];
}

export default function Carousels() {
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCarousels();
  }, []);

  const fetchCarousels = async () => {
    try {
      setLoading(true);
      const response = await api.get<CarouselsResponse>("/carousel/all");
      setCarousels(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Error fetching carousels:", error);
      toast.error("Failed to fetch carousels");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCarousel = async (carouselId: string) => {
    if (!confirm("Are you sure you want to delete this carousel?")) return;
    
    try {
      await api.delete(`/carousel/${carouselId}`);
      toast.success("Carousel deleted successfully");
      fetchCarousels();
    } catch (error) {
      console.error("Error deleting carousel:", error);
      toast.error("Failed to delete carousel");
    }
  };

  const handleToggleStatus = async (carousel: Carousel) => {
    try {
      const newStatus = carousel.status === "active" ? "inactive" : "active";
      await api.put(`/carousel/${carousel.carousel_id}`, { status: newStatus });
      toast.success(`Carousel ${newStatus === "active" ? "activated" : "deactivated"}`);
      fetchCarousels();
    } catch (error) {
      console.error("Error updating carousel status:", error);
      toast.error("Failed to update carousel status");
    }
  };

  const filteredCarousels = carousels.filter((carousel) => {
    const matchesSearch = carousel.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || carousel.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading carousels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Carousels</h1>
          <p className="text-muted-foreground">
            Manage your carousel collections
          </p>
        </div>
        <Button onClick={() => navigate("/carousels/add")} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Create Carousel
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search carousels..."
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
      </div>

      {/* Carousels Grid */}
      {filteredCarousels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No carousels found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first carousel to get started"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={() => navigate("/carousels/add")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Carousel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCarousels.map((carousel) => (
            <Card key={carousel.carousel_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{carousel.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={carousel.status === "active" ? "default" : "secondary"}>
                        {carousel.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {carousel.items?.length || 0} items
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/carousels/${carousel.carousel_id}`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(carousel)}>
                        {carousel.status === "active" ? (
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
                        onClick={() => handleDeleteCarousel(carousel.carousel_id)}
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
                    <span className="text-muted-foreground">Total Duration:</span>
                    <span className="font-medium">{formatDuration(carousel.total_duration)}</span>
                  </div>

                  {carousel.items && carousel.items.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Items:</p>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {carousel.items.slice(0, 3).map((item) => (
                          <div key={item.carousel_item_id} className="flex items-center justify-between text-xs">
                            <span className="truncate flex-1">{item.Ad?.name || "Unknown Ad"}</span>
                            <span className="text-muted-foreground ml-2">
                              {formatDuration(item.Ad?.duration || 0)}
                            </span>
                          </div>
                        ))}
                        {carousel.items.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{carousel.items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(carousel.created_at).toLocaleDateString()}
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
