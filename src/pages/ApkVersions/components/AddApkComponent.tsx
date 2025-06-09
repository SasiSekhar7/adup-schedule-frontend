// src/pages/ApkVersions/components/AddApkComponent.tsx
import { useEffect, useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/api";
// import { toast } from "@/components/ui/use-toast";
import { ApkVersion } from "../columns"; // Import ApkVersion interface

// Helper to format file size for display
const formatBytes = (bytes: number | undefined, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return '';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Helper to suggest next version name (simple increment last segment)
const suggestNextVersionName = (currentVersionName: string): string => {
  if (!currentVersionName) return "1.0.0"; // Default if no previous version

  const parts = currentVersionName.split('.');
  const lastPart = parseInt(parts[parts.length - 1], 10);

  if (isNaN(lastPart)) {
    // If last part is not a number (e.g., "1.0.0-beta"), just increment major/minor
    const numericParts = parts.filter(p => !isNaN(parseInt(p, 10))).map(p => parseInt(p, 10));
    if (numericParts.length >= 2) {
      numericParts[numericParts.length - 1]++; // Increment minor version
      return numericParts.join('.') + ".0"; // Append .0 for patch
    }
    return currentVersionName + ".1"; // Fallback
  }

  // Simple increment of the last segment
  parts[parts.length - 1] = (lastPart + 1).toString();
  return parts.join('.');
};


function AddApkComponent({ onApkAdded }: { onApkAdded: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [apkData, setApkData] = useState<Omit<ApkVersion, 'id' | 'uploaded_at' | 'created_at' | 'updated_at' | 's3_key' | 'checksum_sha256' | 'file_size_bytes'>>({
    version_code: 0,
    version_name: "",
    file_name: "",
    release_notes: "",
    is_mandatory: false,
    is_active: false,
  });
  const [estimatedFileSizeBytes, setEstimatedFileSizeBytes] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);


  // Fetch latest version on dialog open to suggest next version
  useEffect(() => {
    const fetchLatestVersion = async () => {
      try {
        const response = await api.get<{ latestVersionCode: number, latestVersionName: string }>('apk_versions/latest');
        const nextCode = response.latestVersionCode + 1;
        const nextName = suggestNextVersionName(response.latestVersionName);

        setApkData(prev => ({
          ...prev,
          version_code: nextCode,
          version_name: nextName,
        }));
      } catch (err) {
        console.error("Failed to fetch latest APK version for suggestion:", err);
        // Fallback to default if API call fails
        setApkData(prev => ({
          ...prev,
          version_code: 1, // Start from 1 if no previous data or error
          version_name: "0.0.1",
        }));
      }
    };

    if (dialogOpen) {
      resetForm(); // Reset form when dialog opens
      fetchLatestVersion(); // Then fetch latest version
    }
  }, [dialogOpen]); // Run when dialogOpen state changes


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);

    if (selectedFile) {
      setApkData((prev) => ({ ...prev, file_name: selectedFile.name }));
      setEstimatedFileSizeBytes(selectedFile.size); // Set client-side estimated size
    } else {
      setApkData((prev) => ({ ...prev, file_name: "" }));
      setEstimatedFileSizeBytes(undefined);
    }
  };

  const handleCreateApk = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!file) {
        throw new Error("Please select an APK file to upload.");
      }
      if (!apkData.version_code || apkData.version_name === "" || apkData.file_name === "") { // Check for empty string on name/filename
        throw new Error("Please fill in all required APK details (Version Code, Version Name, File Name).");
      }
      if (isNaN(apkData.version_code) || apkData.version_code <= 0) {
        throw new Error("Version Code must be a positive integer.");
      }


      const formData = new FormData();
      formData.append("apk_file", file); // The actual APK file
      formData.append("version_code", apkData.version_code.toString()); // Manual input
      formData.append("version_name", apkData.version_name); // Manual input
      formData.append("file_name", apkData.file_name); // Manual input (usually from selected file name)
      formData.append("release_notes", apkData.release_notes || ""); // Manual input
      formData.append("is_mandatory", apkData.is_mandatory.toString()); // Manual input
      formData.append("is_active", apkData.is_active.toString()); // Manual input

      // Send all data in one API call
      const response = await api.post<ApkVersion>('/apk_versions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // toast({
      //   title: "APK Version Added",
      //   description: `Version ${response.version_name} (Code: ${response.version_code}) has been added.`,
      // });
      setDialogOpen(false); // Close dialog
      onApkAdded(); // Notify parent to refetch data
      resetForm();
    } catch (err: any) {
      console.error("Failed to add new APK version:", err);
      setError(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setApkData(prev => ({
      ...prev, // Keep suggested version from fetch, unless reset
      file_name: "",
      release_notes: "",
      is_mandatory: false,
      is_active: false,
    }));
    setEstimatedFileSizeBytes(undefined);
    setError(null);
  };


  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          Add New APK
          <Plus className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New APK Version</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apkFile" className="text-right">
              APK File
            </Label>
            <Input
              id="apkFile"
              type="file"
              accept=".apk"
              onChange={handleFileChange}
              className="col-span-3"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="versionCode" className="text-right">
              Version Code
            </Label>
            <Input
              id="versionCode"
              type="number" // Ensure this is type number
              value={apkData.version_code} // Make sure it's a number
              onChange={(e) => setApkData((prev) => ({ ...prev, version_code: parseInt(e.target.value) || 0 }))}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="versionName" className="text-right">
              Version Name
            </Label>
            <Input
              id="versionName"
              type="text" // This should be type text for 0.0.1, 1.0.0-beta etc.
              value={apkData.version_name || ""}
              onChange={(e) => setApkData((prev) => ({ ...prev, version_name: e.target.value }))}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fileName" className="text-right">
              File Name
            </Label>
            <Input
              id="fileName"
              type="text"
              value={apkData.file_name || (file ? file.name : "")}
              onChange={(e) => setApkData((prev) => ({ ...prev, file_name: e.target.value }))}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fileSizeEstimate" className="text-right">
              File Size (Estimate)
            </Label>
            <Input
              id="fileSizeEstimate"
              value={formatBytes(estimatedFileSizeBytes)}
              readOnly
              className="col-span-3 bg-gray-100 dark:bg-gray-800"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="releaseNotes" className="text-right pt-2">
              Release Notes
            </Label>
            <Textarea
              id="releaseNotes"
              value={apkData.release_notes || ""}
              onChange={(e) => setApkData((prev) => ({ ...prev, release_notes: e.target.value }))}
              className="col-span-3 resize-y"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isMandatory" className="text-right">
              Mandatory Update
            </Label>
            <Checkbox
              id="isMandatory"
              checked={apkData.is_mandatory}
              onCheckedChange={(checked: boolean) => setApkData((prev) => ({ ...prev, is_mandatory: checked }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">
              Set as Active
            </Label>
            <Checkbox
              id="isActive"
              checked={apkData.is_active}
              onCheckedChange={(checked: boolean) => setApkData((prev) => ({ ...prev, is_active: checked }))}
              className="col-span-3"
            />
          </div>

          {error && <span className="text-red-500 text-sm col-span-full text-center">{error}</span>}
        </div>

        <DialogFooter>
          <Button onClick={handleCreateApk} disabled={loading || !file || !apkData.version_code || apkData.version_name === "" || apkData.file_name === ""}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Adding..." : "Add APK"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddApkComponent;