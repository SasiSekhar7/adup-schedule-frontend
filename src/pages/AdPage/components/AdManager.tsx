"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trash, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import api from "@/api";

// Helper function to format bytes
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Helper function to get file extension
const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".");
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : "";
};

// Single part upload function for files ≤ 50MB using signed URL
async function uploadSingleFile(
  file: File,
  onProgress?: (progress: number, status: string) => void
) {
  // Generate filename in the format: ad-{timestamp}{extension}
  const fileExtension = getFileExtension(file.name);
  const generatedFileName = `ad-${Date.now()}${fileExtension}`;

  // 1️⃣ Get signed URL from backend
  onProgress?.(10, "Getting upload URL...");
  const signedUrlResponse = await api.post("/s3/single-part-upload", {
    fileName: generatedFileName,
    fileType: file.type,
  });

  const { uploadUrl } = signedUrlResponse as any;

  // 2️⃣ Upload file directly to S3 using signed URL
  onProgress?.(20, "Uploading file to S3...");

  await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  onProgress?.(100, "Upload completed!");

  console.log("✅ File uploaded successfully via signed URL");
  return { url: generatedFileName };
}

// Multipart upload function for large files
async function uploadLargeFile(
  file: File,
  onProgress?: (
    progress: number,
    status: string,
    speed: string,
    timeLeft: string
  ) => void
) {
  // Generate filename in the format: ad-{timestamp}{extension}
  const fileExtension = getFileExtension(file.name);
  const generatedFileName = `ad-${Date.now()}${fileExtension}`;

  // 1️⃣ Initialize upload
  const createResponse = await api.post("/s3/create-multipart-upload", {
    fileName: generatedFileName,
    fileType: file.type,
  });

  const { uploadId } = createResponse as any;

  // 2️⃣ Split file into 5MB parts
  const partSize = 5 * 1024 * 1024;
  const partsCount = Math.ceil(file.size / partSize);

  // 3️⃣ Get pre-signed URLs from backend
  const urlsResponse = await api.post("/s3/generate-upload-urls", {
    fileName: generatedFileName,
    uploadId,
    partsCount,
  });

  const { urls } = urlsResponse as any;

  // 4️⃣ Upload each part directly to S3
  const uploadedParts = [];
  let uploadedBytes = 0;
  const startTime = Date.now();

  for (let i = 0; i < urls.length; i++) {
    const start = i * partSize;
    const end = Math.min(start + partSize, file.size);
    const blobPart = file.slice(start, end);

    const res = await fetch(urls[i].signedUrl, {
      method: "PUT",
      body: blobPart,
    });

    if (!res.ok) {
      throw new Error(`Failed to upload part ${i + 1}: ${res.statusText}`);
    }

    const etag = res.headers.get("ETag");
    uploadedParts.push({ ETag: etag, PartNumber: urls[i].partNumber });

    uploadedBytes += blobPart.size;
    const progress = Math.round((uploadedBytes / file.size) * 100);

    // Calculate upload speed and time remaining
    const elapsedTime = Date.now() - startTime;
    const speed = uploadedBytes / (elapsedTime / 1000); // bytes per second
    const remainingBytes = file.size - uploadedBytes;
    const timeLeft = remainingBytes / speed; // seconds

    const speedFormatted = formatBytes(speed) + "/s";
    const timeLeftFormatted =
      timeLeft > 60
        ? `${Math.ceil(timeLeft / 60)}m`
        : `${Math.ceil(timeLeft)}s`;

    onProgress?.(
      progress,
      `Uploading part ${i + 1}/${urls.length}`,
      speedFormatted,
      timeLeftFormatted
    );

    console.log(`Uploaded part ${i + 1}/${urls.length}`);
  }

  // 5️⃣ Complete upload
  const completeResponse = await api.post("/s3/complete-multipart-upload", {
    fileName: generatedFileName,
    uploadId,
    parts: uploadedParts,
  });

  console.log("✅ File uploaded successfully:", completeResponse);
  return { response: completeResponse, url: generatedFileName };
}

export interface AdData {
  ad_id?: string;
  name: string;
  url: string;
  duration: number;
  client_id: string;
  status?: string;
}

interface AdManagerProps {
  initialData?: AdData;
  isEditing: boolean;
}

export default function AdManager({ initialData, isEditing }: AdManagerProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AdData>(
    initialData || {
      name: "",
      url: "",
      duration: 0,
      client_id: "",
    }
  );
  const [file, setFile] = useState<File | null>();
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Progress tracking state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadSpeed, setUploadSpeed] = useState("0 B/s");
  const [timeLeft, setTimeLeft] = useState("calculating...");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Helper function to prepare data for API calls (excludes status field)
  const getApiData = (data: AdData) => {
    const { status, ...apiData } = data;
    return apiData;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // When implementing the update API call, use getApiData to exclude status field
      // const apiData = getApiData(formData);
      // const result = await api.put(`/ads/update/${formData.ad_id}`, apiData);
      // if (result.success) {
      //   router.push(`/ads/${result.ad_id}`)
      // } else {
      //   console.error(result.error)
      // }
    } catch (error) {
      console.error("Failed to submit ad", error);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("Preparing upload...");
    setUploadSpeed("0 B/s");
    setTimeLeft("calculating...");

    try {
      const fileSizeInMB = file.size / (1024 * 1024); // Convert to MB
      const useMultipart = fileSizeInMB > 50;

      if (useMultipart) {
        // Use multipart upload for files > 50MB
        setUploadStatus("Using multipart upload for large file...");

        const uploadResult = await uploadLargeFile(
          file,
          (progress, status, speed, timeLeft) => {
            setUploadProgress(progress);
            setUploadStatus(status);
            setUploadSpeed(speed);
            setTimeLeft(timeLeft);
          }
        );

        // After successful multipart upload, update the ad record
        setUploadStatus("Updating ad record...");

        await api.post(`/ads/file/edit/${formData.ad_id}`, {
          file_url: uploadResult.url,
          isMultipartUpload: true,
        });
      } else {
        // Use signed URL upload for files ≤ 50MB
        setUploadStatus("Using signed URL upload for file...");

        const uploadResult = await uploadSingleFile(
          file,
          (progress, status) => {
            setUploadProgress(progress);
            setUploadStatus(status);
          }
        );

        // After successful upload, update the ad record
        setUploadStatus("Updating ad record...");

        await api.post(`/ads/file/edit/${formData.ad_id}`, {
          file_url: uploadResult.url,
          isMultipartUpload: false,
        });
      }

      setUploadStatus("Upload completed successfully!");
      console.log(
        `Upload completed successfully using ${
          useMultipart ? "multipart" : "signed URL"
        } method`
      );

      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus("");
        setUploadSpeed("0 B/s");
        setTimeLeft("calculating...");
      }, 2000);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("Upload failed. Please try again.");

      // Reset progress after error
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus("");
        setUploadSpeed("0 B/s");
        setTimeLeft("calculating...");
      }, 3000);
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };
  const cleanUrl = formData?.url?.split("?")[0]; // Remove query parameters

  const isVideo = /\.(mp4|webm|ogg)$/i.test(cleanUrl);
  const isImage = /\.(jpeg|jpg|gif|png)$/i.test(cleanUrl);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.post(`/ads/delete/${formData.ad_id}`);

      setLoading(false);
      navigate("/ads");
    } catch (error) {
      setLoading(false);

      console.log(error);
    }
  };
  return (
    <div className="flex h-screen">
      <div className="w-2/3 p-6 overflow-auto">
        <Card>
          <CardHeader className="flex flex-row items-center">
            <CardTitle>{isEditing ? "Edit Ad" : "Ad Details"}</CardTitle>
            <div className="flex items-center space-x-2 ml-auto">
              <Dialog>
                <DialogTrigger>
                  {isEditing && (
                    <Button variant="destructive">
                      <Trash />
                      Delete Ad
                    </Button>
                  )}
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Are you sure you want to delete the ad?
                    </DialogTitle>
                  </DialogHeader>

                  <DialogFooter>
                    <Button onClick={handleDelete} disabled={loading}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {!isEditing && (
                <Button onClick={() => navigate(`/ads/${formData.ad_id}/edit`)}>
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  readOnly={!isEditing}
                />
              </div>
              {/* <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  value={formData.url}
                  onChange={handleChange}
                  required
                  readOnly={!isEditing}
                />
              </div> */}
              <div>
                <Label htmlFor="duration">Duration (in seconds)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="client_id">Client ID</Label>
                <Input
                  id="client_id"
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  required
                  readOnly
                />
              </div>
              {formData.status && (
                <div>
                  <Label htmlFor="status">Status</Label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        formData.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : formData.status === "processing"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : formData.status === "completed"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : formData.status === "failed"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      {formData.status}
                    </span>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            {isEditing && (
              <Dialog>
                <DialogTrigger>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload New File"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Upload image or video file of duration (10s)
                    </DialogTitle>
                  </DialogHeader>

                  <Input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0])}
                  />

                  {/* File info and upload method */}
                  {file && !isUploading && (
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>File: {file.name}</div>
                      <div>Size: {formatBytes(file.size)}</div>
                      <div className="flex items-center gap-2">
                        <span>Upload method:</span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            file.size > 50 * 1024 * 1024
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {file.size > 50 * 1024 * 1024
                            ? "Multipart (>50MB)"
                            : "Signed URL (≤50MB)"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Progress UI */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{uploadStatus}</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Speed: {uploadSpeed}</span>
                        <span>Time left: {timeLeft}</span>
                      </div>
                    </div>
                  )}

                  <DialogFooter>
                    <Button onClick={handleUpload} disabled={isUploading}>
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardFooter>
        </Card>
      </div>

      <div className="w-1/3 bg-gray-100 p-6 sticky top-0 h-[82vh]">
        <div className="h-full flex items-center justify-center">
          <div className="w-full max-w-[300px] aspect-[9/16] bg-white shadow-lg rounded-lg overflow-hidden">
            {isVideo && (
              <video
                src={formData.url}
                controls
                className="w-full h-full object-cover"
              >
                Your browser does not support the video tag.
              </video>
            )}
            {isImage && (
              <img
                src={formData.url || "/placeholder.svg"}
                alt={formData.name}
                className="w-full h-full object-cover"
              />
            )}
            {!isVideo && !isImage && (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Preview not available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
