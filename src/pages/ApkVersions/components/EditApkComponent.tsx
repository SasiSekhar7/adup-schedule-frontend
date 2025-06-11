import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/api";
import { toast } from "sonner"; // IMPORT SONNER TOAST HERE
import { ApkVersion } from "../columns"; // Import ApkVersion interface

// Helper to format file size (if not global)
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

function EditApkComponent({
  apk, // The existing ApkVersion object to edit
  isOpen, // Controls dialog visibility
  onClose, // Callback to close dialog
  onApkUpdated, // Callback to signal successful update to parent
}: {
  apk: ApkVersion;
  isOpen: boolean;
  onClose: () => void;
  onApkUpdated?: () => void; // Made optional as it might not always be used
}) {
  const [editedApk, setEditedApk] = useState<Partial<ApkVersion>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Initialize editedApk with the current apk data when dialog opens
    if (isOpen) {
        setEditedApk({
            version_name: apk.version_name,
            release_notes: apk.release_notes,
            is_mandatory: apk.is_mandatory,
            is_active: apk.is_active,
        });
        setError(null); // Clear any previous errors
    }
  }, [apk, isOpen]);

  const handleUpdateApk = async () => {
    setLoading(true);
    setError(null);

    try {
      const dataToUpdate = {
        version_name: editedApk.version_name,
        release_notes: editedApk.release_notes,
        is_mandatory: editedApk.is_mandatory,
        is_active: editedApk.is_active,
      };

      // Filter out undefined values to ensure only changed/valid fields are sent
      const filteredData = Object.fromEntries(
        Object.entries(dataToUpdate).filter(([, value]) => value !== undefined)
      );

      // Use toast.promise for better UX during async operations
      await toast.promise(api.put(`/apk_versions/${apk.id}`, filteredData), {
        loading: `Updating version ${apk.version_name}...`,
        success: () => {
          onClose(); // Close dialog on success
          onApkUpdated?.(); // Notify parent of update
          return `Version ${apk.version_name} (${apk.version_code}) updated successfully!`;
        },
        error: (err) => {
          console.error("Failed to update APK version:", err);
          const errorMessage = err.response?.data?.message || "An unexpected error occurred.";
          setError(errorMessage); // Set internal error for form
          return `Error updating version: ${errorMessage}`; // Toast error message
        },
      });

    } catch (err: any) {
      // This catch block is mostly for unhandled errors, toast.promise handles API errors
      console.error("Caught error outside toast.promise:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit APK Version: {apk.version_name} ({apk.version_code})</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Read-only fields derived from the original APK object */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Version Code</Label>
            <Input value={apk.version_code} readOnly className="col-span-3 bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">File Name</Label>
            <Input value={apk.file_name} readOnly className="col-span-3 bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">File Size</Label>
            <Input value={apk.file_size_bytes ? formatBytes(apk.file_size_bytes) : ''} readOnly className="col-span-3 bg-gray-100 dark:bg-gray-800" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">SHA-256 Checksum</Label>
            <Input value={apk.checksum_sha256} readOnly className="col-span-3 text-xs bg-gray-100 dark:bg-gray-800" />
          </div>

          {/* Editable fields */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="versionName" className="text-right">
              Version Name
            </Label>
            <Input
              id="versionName"
              value={editedApk.version_name || ""}
              onChange={(e) => setEditedApk((prev) => ({ ...prev, version_name: e.target.value }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="releaseNotes" className="text-right pt-2">
              Release Notes
            </Label>
            <Textarea
              id="releaseNotes"
              value={editedApk.release_notes || ""}
              onChange={(e) => setEditedApk((prev) => ({ ...prev, release_notes: e.target.value }))}
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
              checked={editedApk.is_mandatory}
              onCheckedChange={(checked: boolean) => setEditedApk((prev) => ({ ...prev, is_mandatory: checked }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">
              Set as Active
            </Label>
            <Checkbox
              id="isActive"
              checked={editedApk.is_active}
              onCheckedChange={(checked: boolean) => setEditedApk((prev) => ({ ...prev, is_active: checked }))}
              className="col-span-3"
            />
          </div>

          {error && <span className="text-red-500 text-sm col-span-full text-center">{error}</span>}
        </div>

        <DialogFooter>
          <Button onClick={handleUpdateApk} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditApkComponent;