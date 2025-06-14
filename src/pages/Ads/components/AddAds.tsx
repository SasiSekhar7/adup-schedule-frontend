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

// Helper function to format bytes into a readable string (KB, MB, GB)
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

interface AdToSubmit {
  client_id?: string;
  name?: string;
  duration: number;
}

function AddAdComponent({ onIsOpenChange }: { onIsOpenChange: () => void }) {
  const [clients, setClients] = useState<{ client_id: string; name: string }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [ad, setAd] = useState<AdToSubmit>({ duration: 10 });
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Progress and Speed States
  const [uploadProgress, setUploadProgress] = useState<number>(0); // 0-100%
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadSpeed, setUploadSpeed] = useState<string>('0 B/s');
  const [timeLeft, setTimeLeft] = useState<string>('calculating...');

  // Drag & Drop specific states
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  // Ref to the actual hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs for tracking upload speed and time
  const lastLoadedRef = useRef(0);
  const lastTimeRef = useRef(0);
  const uploadStartTimeRef = useRef(0);

  useEffect(() => {
    const role = getRole();
    setUserRole(role);
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { clients } = await api.get("/ads/clients");
        setClients(clients);
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
    setFile(selectedFile);
    setError(undefined);
    setUploadProgress(0);
    setUploadStatus('');
    setUploadSpeed('0 B/s');
    setTimeLeft('calculating...');

    // Crucial: Clear the file input's value when a file is removed or changed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [handleFileSelection]);


  const handleCreate = async () => {
    setLoading(true);
    setError(undefined);
    setUploadProgress(0);
    setUploadStatus('Preparing upload...');
    setUploadSpeed('0 B/s');
    setTimeLeft('calculating...');
    lastLoadedRef.current = 0;
    lastTimeRef.current = Date.now();
    uploadStartTimeRef.current = Date.now();

    try {
      if (!file) throw new Error("No File uploaded. Please select or drag a file.");
      const { name, duration, client_id } = ad;

      if (!name || !duration || (userRole === "Admin" && !client_id)) {
        throw new Error("Missing Parameters. Please fill all required fields.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      formData.append("duration", duration.toString());
      if (client_id) formData.append("client_id", client_id);

      await api.post("/ads/add", formData, {
        onUploadProgress: (progressEvent: any) => {
          const { loaded, total } = progressEvent;
          const currentTime = Date.now();

          const bytesTransferred = loaded - lastLoadedRef.current;
          const timeElapsed = currentTime - lastTimeRef.current;

          if (timeElapsed > 0) {
            const speedBps = (bytesTransferred / timeElapsed) * 1000;
            setUploadSpeed(`${formatBytes(speedBps)}/s`);

            const bytesRemaining = total - loaded;
            const estimatedSecondsLeft = bytesRemaining / speedBps;

            if (isFinite(estimatedSecondsLeft) && estimatedSecondsLeft > 0) {
                const minutes = Math.floor(estimatedSecondsLeft / 60);
                const seconds = Math.round(estimatedSecondsLeft % 60);
                setTimeLeft(`${minutes > 0 ? minutes + 'm ' : ''}${seconds}s left`);
            } else {
                setTimeLeft('calculating...');
            }
          }

          lastLoadedRef.current = loaded;
          lastTimeRef.current = currentTime;

          const percentCompleted = Math.round((loaded * 100) / total);
          setUploadProgress(percentCompleted);

          if (percentCompleted < 100) {
            setUploadStatus(`Uploading file... ${formatBytes(loaded)} / ${formatBytes(total)}`);
          } else {
            setUploadStatus('File uploaded. Processing on server...');
            setUploadSpeed('0 B/s');
            setTimeLeft('Done.');
          }
        },
      });

      setUploadStatus('Upload complete!');
      setUploadProgress(100);
      setTimeout(() => {
        setOpen(false);
        onIsOpenChange();
        // Reset form fields and state only AFTER dialog closes
        setFile(null);
        setAd({ duration: 10 });
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Ensure input value is cleared
        }
      }, 1000);

    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.error || err.message || "An unexpected error occurred during upload.";
      setError(errorMessage);
      setUploadStatus('Upload failed.');
      setUploadProgress(0);
      setUploadSpeed('0 B/s');
      setTimeLeft('N/A');
      setLoading(false); // If upload failed, show the form again with error
    }
  };

  useEffect(() => {
    if (!file) {
      setAd((prev) => ({ ...prev, duration: 10 }));
      return;
    }

    const updateDuration = async () => {
      if (file.type.startsWith("video/")) {
        const duration = await getDuration(file);
        setAd((prev) => ({ ...prev, duration: Math.round(duration) || 10 }));
      } else {
        setAd((prev) => ({ ...prev, duration: 10 }));
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
    <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) { // Reset all states when dialog closes
            setLoading(false);
            setFile(null);
            setAd({ duration: 10 });
            setError(undefined);
            setUploadProgress(0);
            setUploadStatus('');
            setUploadSpeed('0 B/s');
            setTimeLeft('calculating...');
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Ensure input value is cleared on close
            }
        }
    }}>
      <DialogTrigger asChild>
        <Button>
          Upload Ad
          <Plus className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{loading ? "Uploading Ad..." : "Create New Ad"}</DialogTitle>
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
                          strokeDashoffset={2 * Math.PI * 60 * (1 - uploadProgress / 100)}
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
                  <p className="font-semibold text-lg text-blue-800">{uploadStatus}</p>
                  {uploadProgress < 100 && uploadSpeed !== '0 B/s' && (
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
                          onValueChange={(client_id) => setAd((prev) => ({ ...prev, client_id }))}
                          value={ad.client_id || ''}
                      >
                          <SelectTrigger id="client" className="w-full">
                              <SelectValue placeholder="Select Client" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectGroup>
                                  {clients.map((client) => (
                                      <SelectItem key={client.client_id} value={client.client_id}>
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
                      isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-gray-50",
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
                          <span className="font-medium text-green-700">Selected: {file.name} ({formatBytes(file.size)})</span>
                      ) : (
                          <>
                              <span className="font-medium">Drag & drop your ad file here</span>
                              <br />
                              or click to browse
                          </>
                      )}
                  </p>
                  <Input
                      id="file-upload-input"
                      type="file"
                      className="hidden" // Hide the actual input
                      ref={fileInputRef} // Attach ref here
                      onChange={(e) => handleFileSelection(e.target.files?.[0] || null)}
                  />
                  {file && (
                      <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-red-500 hover:text-red-700"
                          onClick={(e) => {
                              e.stopPropagation(); // Prevent dialog from closing or drag-drop area click
                              handleFileSelection(null); // Clear file state and input value via callback
                          }}
                      >
                          Remove file
                      </Button>
                  )}
              </div>

              <div className="grid gap-2">
                  <Label htmlFor="name">Ad Name</Label>
                  <Input
                      id="name"
                      type="text"
                      value={ad.name || ""}
                      onChange={(e) => setAd((prev) => ({ ...prev, name: e.target.value }))}
                  />
              </div>

              <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                      id="duration"
                      type="number"
                      value={ad.duration}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                  />
              </div>

              {error && (
                  <div className="text-red-500 text-sm p-3 border border-red-300 bg-red-50 rounded-md">
                      {error}
                  </div>
              )}
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button onClick={handleCreate} disabled={loading || !file || !ad.name || (userRole === "Admin" && !ad.client_id)}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Uploading..." : "Create Ad"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddAdComponent;