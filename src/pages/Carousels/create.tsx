import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  GripVertical,
  Upload,
  ArrowLeft,
  Save
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/api";

// File upload utility functions
const getFileExtension = (filename: string): string => {
  return filename.substring(filename.lastIndexOf('.'));
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Single part upload function for files ≤ 50MB using signed URL
async function uploadSingleFile(
  file: File,
  onProgress?: (progress: number, status: string) => void
) {
  const fileExtension = getFileExtension(file.name);
  const generatedFileName = `ad-${Date.now()}${fileExtension}`;

  onProgress?.(10, "Getting upload URL...");
  const signedUrlResponse = await api.post("/s3/single-part-upload", {
    fileName: generatedFileName,
    fileType: file.type,
  });

  const { uploadUrl } = signedUrlResponse as any;

  onProgress?.(30, "Uploading file...");
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.statusText}`);
  }

  onProgress?.(100, "Upload complete!");
  return { url: generatedFileName };
}

// Multipart upload function for large files
async function uploadLargeFile(
  file: File,
  onProgress?: (progress: number, status: string, speed: string, timeLeft: string) => void
) {
  const fileExtension = getFileExtension(file.name);
  const generatedFileName = `ad-${Date.now()}${fileExtension}`;

  const createResponse = await api.post("/s3/create-multipart-upload", {
    fileName: generatedFileName,
    fileType: file.type,
  });

  const { uploadId } = createResponse as any;

  const partSize = 5 * 1024 * 1024;
  const partsCount = Math.ceil(file.size / partSize);

  const urlsResponse = await api.post("/s3/generate-upload-urls", {
    fileName: generatedFileName,
    uploadId,
    partsCount,
  });

  const { urls } = urlsResponse as any;

  const uploadedParts = [];
  let uploadedBytes = 0;
  const startTime = Date.now();

  for (let i = 0; i < urls.length; i++) {
    const start = i * partSize;
    const end = Math.min(start + partSize, file.size);
    const part = file.slice(start, end);

    const partStartTime = Date.now();
    const uploadResponse = await fetch(urls[i], {
      method: "PUT",
      body: part,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Part ${i + 1} upload failed: ${uploadResponse.statusText}`);
    }

    const etag = uploadResponse.headers.get("ETag");
    uploadedParts.push({
      ETag: etag,
      PartNumber: i + 1,
    });

    uploadedBytes += part.size;
    const progress = Math.round((uploadedBytes / file.size) * 100);

    const elapsedTime = Date.now() - startTime;
    const speed = uploadedBytes / (elapsedTime / 1000);
    const remainingBytes = file.size - uploadedBytes;
    const timeLeft = remainingBytes / speed;

    const speedFormatted = formatBytes(speed) + '/s';
    const timeLeftFormatted = timeLeft > 0 ? Math.round(timeLeft) + 's' : '0s';

    onProgress?.(
      progress,
      `Uploading part ${i + 1}/${urls.length}... ${formatBytes(uploadedBytes)} / ${formatBytes(file.size)}`,
      speedFormatted,
      timeLeftFormatted
    );
  }

  const completeResponse = await api.post("/s3/complete-multipart-upload", {
    fileName: generatedFileName,
    uploadId,
    parts: uploadedParts,
  });

  return { response: completeResponse, url: generatedFileName };
}
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Ad {
  ad_id: string;
  name: string;
  duration: number;
  status: string;
  url?: string;
}

interface CarouselItem {
  id: string; // temporary ID for new items
  ad_id?: string;
  name?: string;
  duration?: number;
  file_url?: string;
  display_order: number;
  isNew?: boolean;
  ad?: Ad;
}

interface AdsResponse {
  ads: Ad[];
}

// Sortable Item Component
function SortableCarouselItem({
  item,
  onRemove,
  onDurationChange,
  onItemUpdate
}: {
  item: CarouselItem;
  onRemove: () => void;
  onDurationChange: (duration: number) => void;
  onItemUpdate?: (updates: Partial<CarouselItem>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !onItemUpdate) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadStatus("Preparing upload...");

      const fileSizeInMB = file.size / (1024 * 1024);
      const useMultipart = fileSizeInMB > 50;

      let uploadResult;

      if (useMultipart) {
        uploadResult = await uploadLargeFile(
          file,
          (progress, status) => {
            setUploadProgress(progress);
            setUploadStatus(status);
          }
        );
      } else {
        uploadResult = await uploadSingleFile(
          file,
          (progress, status) => {
            setUploadProgress(progress);
            setUploadStatus(status);
          }
        );
      }

      onItemUpdate({ file_url: uploadResult.url });
      setUploadStatus("Upload complete!");
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
      setUploadStatus("Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadStatus("");
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border rounded-lg bg-background"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1">
        {item.isNew ? (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Ad name"
                value={item.name || ""}
                onChange={(e) => onItemUpdate?.({ name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Duration (seconds)"
                value={item.duration || ""}
                onChange={(e) => onDurationChange(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  accept="video/*,image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload File"}
                </Button>
                {item.file_url && (
                  <span className="text-sm text-green-600">✓ File uploaded</span>
                )}
              </div>

              {uploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{uploadStatus}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{item.ad?.name || item.name || "Unknown Ad"}</p>
                <Badge variant="outline">Existing</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Duration: {item.ad?.duration || item.duration || 0}s
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Label htmlFor={`duration-${item.id}`} className="text-xs">Duration:</Label>
                <Input
                  id={`duration-${item.id}`}
                  type="number"
                  value={item.duration || item.ad?.duration || 0}
                  onChange={(e) => onDurationChange(Number(e.target.value))}
                  className="w-16 h-8 text-xs"
                  min="1"
                />
                <span className="text-xs text-muted-foreground">s</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreateCarousel() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [carouselName, setCarouselName] = useState("");
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [availableAds, setAvailableAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAds, setLoadingAds] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchAvailableAds();
    if (isEdit) {
      fetchCarouselData();
    }
  }, [id]);

  const fetchAvailableAds = async () => {
    try {
      setLoadingAds(true);
      const response = await api.get<AdsResponse>("/ads/all");
      setAvailableAds(response?.ads?.filter((ad: Ad) => ad.status === "completed") || (response as any).ads?.filter((ad: Ad) => ad.status === "completed") || []);
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast.error("Failed to fetch available ads");
    } finally {
      setLoadingAds(false);
    }
  };

  const fetchCarouselData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/carousel/${id}`);
      const carousel = response.data;
      
      setCarouselName(carousel.name);
      setItems(carousel.items?.map((item: any) => ({
        id: item.carousel_item_id,
        ad_id: item.Ad.ad_id,
        name: item.Ad.name,
        duration: item.Ad.duration,
        display_order: item.display_order,
        isNew: false
      })) || []);
    } catch (error) {
      console.error("Error fetching carousel:", error);
      toast.error("Failed to fetch carousel data");
      navigate("/carousels");
    } finally {
      setLoading(false);
    }
  };

  const addExistingAd = (adId: string) => {
    const ad = availableAds.find(a => a.ad_id === adId);
    if (!ad) return;

    const newItem: CarouselItem = {
      id: `temp-${Date.now()}`,
      ad_id: ad.ad_id,
      name: ad.name,
      duration: ad.duration,
      display_order: items.length + 1,
      isNew: false
    };

    setItems([...items, newItem]);
  };

  const addNewAd = () => {
    const newItem: CarouselItem = {
      id: `new-${Date.now()}`,
      name: "",
      duration: 0,
      file_url: "",
      display_order: items.length + 1,
      isNew: true
    };

    setItems([...items, newItem]);
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const updateItem = (itemId: string, updates: Partial<CarouselItem>) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const updateItemDuration = (itemId: string, duration: number) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, duration } : item
    ));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update display_order
        return newItems.map((item, index) => ({
          ...item,
          display_order: index + 1
        }));
      });
    }
  };

  const handleSubmit = async () => {
    if (!carouselName.trim()) {
      toast.error("Please enter a carousel name");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item to the carousel");
      return;
    }

    // Validate new ads
    const invalidNewAds = items.filter(item => 
      item.isNew && (!item.name?.trim() || !item.duration || !item.file_url?.trim())
    );

    if (invalidNewAds.length > 0) {
      toast.error("Please fill in all fields for new ads");
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        name: carouselName,
        items: items.map(item => {
          if (item.isNew) {
            return {
              name: item.name,
              duration: item.duration,
              file_url: item.file_url,
              display_order: item.display_order
            };
          } else {
            return {
              ad_id: item.ad_id,
              display_order: item.display_order
            };
          }
        })
      };

      if (isEdit) {
        await api.put(`/carousel/${id}`, payload);
        toast.success("Carousel updated successfully");
      } else {
        await api.post("/carousel/create", payload);
        toast.success("Carousel created successfully");
      }

      navigate("/carousels");
    } catch (error) {
      console.error("Error saving carousel:", error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} carousel`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingAds) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/carousels")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {isEdit ? "Edit Carousel" : "Create Carousel"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "Update your carousel configuration" : "Create a new carousel with multiple ads"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Carousel Name</Label>
                <Input
                  id="name"
                  value={carouselName}
                  onChange={(e) => setCarouselName(e.target.value)}
                  placeholder="Enter carousel name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Carousel Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Carousel Items</CardTitle>
                <div className="flex gap-2">
                  <Select onValueChange={addExistingAd}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Add existing ad" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAds.map((ad) => (
                        <SelectItem key={ad.ad_id} value={ad.ad_id}>
                          {ad.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addNewAd} variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    New Ad
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No items added yet. Add existing ads or create new ones.</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <SortableCarouselItem
                          key={item.id}
                          item={item}
                          onRemove={() => removeItem(item.id)}
                          onDurationChange={(duration) => updateItemDuration(item.id, duration)}
                          onItemUpdate={(updates) => updateItem(item.id, updates)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Items:</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Duration:</span>
                <span className="font-medium">
                  {Math.floor(items.reduce((sum, item) => sum + (item.duration || 0), 0) / 60)}m{" "}
                  {items.reduce((sum, item) => sum + (item.duration || 0), 0) % 60}s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">New Ads:</span>
                <span className="font-medium">{items.filter(item => item.isNew).length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !carouselName.trim() || items.length === 0}
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
                      {isEdit ? "Update Carousel" : "Create Carousel"}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/carousels")}
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
