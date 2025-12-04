import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Save, UploadCloud } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Assuming this is your Shadcn Input
import api from "@/api";
import { getRole } from "@/helpers";
import { cn } from "@/lib/utils"; // Assuming you have a utility for class merging (from shadcn/ui)

// Define allowed file types
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"]; // image/jpeg covers both .jpg and .jpeg
const ALL_ALLOWED_FILE_TYPES = [...ALLOWED_VIDEO_TYPES, ...ALLOWED_IMAGE_TYPES];
const ALLOWED_FILE_EXTENSIONS = ".mp4, .png, .jpg, .jpeg .mov .webm ";

// Helper function to format bytes into a readable string (KB, MB, GB)
const formatBytes = (bytes: number, decimals = 2) => {
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

    const etag = res.headers.get("ETag")?.replace(/"/g, "");
    if (!etag) {
      throw new Error(`No ETag received for part ${i + 1}`);
    }

    uploadedParts.push({ ETag: etag, PartNumber: urls[i].partNumber });
    uploadedBytes += blobPart.size;

    // Calculate progress and speed
    const progress = Math.round((uploadedBytes / file.size) * 100);
    const elapsedTime = Date.now() - startTime;
    const speed = uploadedBytes / (elapsedTime / 1000); // bytes per second
    const remainingBytes = file.size - uploadedBytes;
    const estimatedTimeLeft = remainingBytes / speed; // seconds

    const speedFormatted = `${formatBytes(speed)}/s`;
    const timeLeftFormatted =
      estimatedTimeLeft > 0 && isFinite(estimatedTimeLeft)
        ? `${Math.floor(estimatedTimeLeft / 60)}m ${Math.round(
            estimatedTimeLeft % 60
          )}s left`
        : "calculating...";

    onProgress?.(
      progress,
      `Uploading part ${i + 1}/${urls.length}... ${formatBytes(
        uploadedBytes
      )} / ${formatBytes(file.size)}`,
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

interface AdToSubmit {
  client_id?: string;
  name?: string;
  duration: number;
}

function AddAdComponent({ onIsOpenChange }: { onIsOpenChange: () => void }) {
  const [clients, setClients] = useState<{ client_id: string; name: string }[]>(
    []
  );
  const [file, setFile] = useState<File | null>(null);
  const [ad, setAd] = useState<AdToSubmit>({ duration: 10 });
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Progress and Speed States
  const [uploadProgress, setUploadProgress] = useState<number>(0); // 0-100%
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploadSpeed, setUploadSpeed] = useState<string>("0 B/s");
  const [timeLeft, setTimeLeft] = useState<string>("calculating...");

  // Drag & Drop specific states
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  // Ref to the actual hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const role = getRole();
    setUserRole(role);
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get("/ads/clients");
        setClients((response as any).clients);
      } catch (err) {
        console.error(err);
      }
    };

    if (userRole === "Admin") {
      fetchClients();
    }
  }, [userRole]);

  // Handler for file input and drag/drop
  const handleFileSelection = useCallback((selectedFile: File | null) => {
    setError(undefined); // Clear previous errors

    if (!selectedFile) {
      setFile(null);
      // Crucial: Clear the file input's value when a file is removed or changed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setUploadProgress(0);
      setUploadStatus("");
      setUploadSpeed("0 B/s");
      setTimeLeft("calculating...");
      return;
    }

    // Validate file type
    if (!ALL_ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setError(
        `Invalid file type. Only ${ALLOWED_FILE_EXTENSIONS} files are allowed.`
      );
      setFile(null); // Clear the file if it's invalid
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Ensure input value is cleared for invalid files
      }
      return;
    }

    setFile(selectedFile);
    setUploadProgress(0);
    setUploadStatus("");
    setUploadSpeed("0 B/s");
    setTimeLeft("calculating...");
  }, []);

  // Drag & Drop Handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
        e.dataTransfer.clearData();
      }
    },
    [handleFileSelection]
  );

  const handleCreate = async () => {
    setLoading(true);
    setError(undefined);
    setUploadProgress(0);
    setUploadStatus("Preparing upload...");
    setUploadSpeed("0 B/s");
    setTimeLeft("calculating...");

    try {
      if (!file)
        throw new Error("No File uploaded. Please select or drag a file.");

      // Double-check file type validity right before upload
      if (!ALL_ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error(
          `Invalid file type. Only ${ALLOWED_FILE_EXTENSIONS} files are allowed.`
        );
      }

      const { name, duration, client_id } = ad;

      if (!name || !duration || (userRole === "Admin" && !client_id)) {
        throw new Error("Missing Parameters. Please fill all required fields.");
      }

      const fileSizeInMB = file.size / (1024 * 1024); // Convert to MB
      const useMultipart = fileSizeInMB > 50;

      let adData;

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

        // After successful multipart upload, create the ad record
        setUploadStatus("Creating ad record...");

        adData = {
          name,
          duration: duration.toString(),
          file_url: uploadResult.url,
          isMultipartUpload: true,
          ...(client_id && { client_id }),
        };

        await api.post("/ads/add", adData, {
          headers: {
            "Content-Type": "application/json",
          },
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

        // After successful upload, create the ad record
        setUploadStatus("Creating ad record...");

        adData = {
          name,
          duration: duration.toString(),
          file_url: uploadResult.url,
          isMultipartUpload: false,
          ...(client_id && { client_id }),
        };

        await api.post("/ads/add", adData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      setUploadStatus("Upload complete!");
      setUploadProgress(100);
      setTimeout(() => {
        setOpen(false);
        onIsOpenChange();
        // Reset form fields and state only AFTER dialog closes
        setFile(null);
        setAd({ duration: 10 });
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Ensure input value is cleared
        }
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "An unexpected error occurred during upload.";
      setError(errorMessage);
      setUploadStatus("Upload failed.");
      setUploadProgress(0);
      setUploadSpeed("0 B/s");
      setTimeLeft("N/A");
      setLoading(false); // If upload failed, show the form again with error
    }
  };

  useEffect(() => {
    if (!file) {
      setAd((prev) => ({ ...prev, duration: 10 }));
      return;
    }

    const updateDuration = async () => {
      // Only get duration for video files
      if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
        const duration = await getDuration(file);
        setAd((prev) => ({ ...prev, duration: Math.round(duration) || 10 }));
      } else {
        setAd((prev) => ({ ...prev, duration: 10 })); // Default duration for image files
      }
    };

    updateDuration();
  }, [file]);

  async function getDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = url;
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(video.duration);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(0);
      };
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          // Reset all states when dialog closes
          setLoading(false);
          setFile(null);
          setAd({ duration: 10 });
          setError(undefined);
          setUploadProgress(0);
          setUploadStatus("");
          setUploadSpeed("0 B/s");
          setTimeLeft("calculating...");
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Ensure input value is cleared on close
          }
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          Upload Ad
          <Plus className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {loading ? "Uploading Ad..." : "Create New Ad"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="60"
                  cx="64"
                  cy="64"
                />
                <circle
                  className="text-blue-500 transition-all duration-300 ease-in-out"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={
                    2 * Math.PI * 60 * (1 - uploadProgress / 100)
                  }
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="60"
                  cx="64"
                  cy="64"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-blue-700">
                {uploadProgress}%
              </span>
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-lg text-blue-800">
                {uploadStatus}
              </p>
              {uploadProgress < 100 && uploadSpeed !== "0 B/s" && (
                <div className="text-sm text-gray-700">
                  <p>Speed: {uploadSpeed}</p>
                  <p>Time Left: {timeLeft}</p>
                </div>
              )}
            </div>
            {error && (
              <div className="text-red-500 text-sm p-3 border border-red-300 bg-red-50 rounded-md mt-4 w-full text-center">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            {userRole === "Admin" && (
              <div className="grid gap-2">
                <Label htmlFor="client">Client</Label>
                <Select
                  onValueChange={(client_id) =>
                    setAd((prev) => ({ ...prev, client_id }))
                  }
                  value={ad.client_id || ""}
                >
                  <SelectTrigger id="client" className="w-full">
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {clients.map((client) => (
                        <SelectItem
                          key={client.client_id}
                          value={client.client_id}
                        >
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div
              className={cn(
                "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors duration-200 cursor-pointer min-h-[120px]",
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 bg-gray-50",
                file ? "border-green-500 bg-green-50" : ""
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              // Clicking the div will trigger the hidden file input
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1 text-center">
                {file ? (
                  <span className="font-medium text-green-700">
                    Selected: {file.name} ({formatBytes(file.size)})
                  </span>
                ) : (
                  <>
                    <span className="font-medium">
                      Drag & drop your ad file here
                    </span>
                    <br />
                    or click to browse
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                Allowed formats: {ALLOWED_FILE_EXTENSIONS}
              </p>
              <Input
                id="file-upload-input"
                type="file"
                className="hidden" // Hide the actual input
                ref={fileInputRef} // Attach ref here
                onChange={(e) =>
                  handleFileSelection(e.target.files?.[0] || null)
                }
                accept={ALL_ALLOWED_FILE_TYPES.join(",")} // Add accept attribute for native file dialog filtering
              />
              {file && (
                <div className="mt-2 space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent dialog from closing or drag-drop area click
                      handleFileSelection(null); // Clear file state and input value via callback
                    }}
                  >
                    Remove file
                  </Button>

                  {/* File info and upload method */}
                  <div className="text-sm text-gray-600 space-y-1 p-2 bg-gray-50 rounded">
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
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Ad Name</Label>
              <Input
                id="name"
                type="text"
                value={ad.name || ""}
                onChange={(e) =>
                  setAd((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              {file && ALLOWED_IMAGE_TYPES.includes(file.type) ? (
                // Dropdown for image files
                <Select
                  value={ad.duration?.toString() || "10"}
                  onValueChange={(value) =>
                    setAd((prev) => ({
                      ...prev,
                      duration: parseInt(value) || 10,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="20">20 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="45">45 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                // Read-only input for video files or when no file is selected
                <Input
                  id="duration"
                  type="number"
                  value={ad.duration}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                  placeholder={
                    file && ALLOWED_VIDEO_TYPES.includes(file.type)
                      ? "Auto-detected from video"
                      : "Select a file first"
                  }
                />
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm p-3 border border-red-300 bg-red-50 rounded-md">
                {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button
            onClick={handleCreate}
            disabled={
              loading ||
              !file ||
              !ad.name ||
              (userRole === "Admin" && !ad.client_id) ||
              !!error
            }
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Uploading..." : "Create Ad"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddAdComponent;
