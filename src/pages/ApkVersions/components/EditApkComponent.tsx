// src/pages/ApkVersions/components/EditApkComponent.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/api";
// import { toast } from "@/components/ui/use-toast";
import { ApkVersion } from "../columns"; // Import ApkVersion interface

function EditApkComponent({
  apk, // The existing ApkVersion object to edit
  // onApkUpdated, // Callback to refetch data after update
  children // To allow custom trigger (e.g., a Button from columns)
}: {
  apk: ApkVersion;
  onApkUpdated: () => void;
  children: React.ReactNode;
}) {
  const [editedApk, setEditedApk] = useState<Partial<ApkVersion>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    // Initialize editedApk with the current apk data when dialog opens
    // or when the prop changes.
    if (dialogOpen) {
        setEditedApk({
            version_name: apk.version_name,
            release_notes: apk.release_notes,
            is_mandatory: apk.is_mandatory,
            is_active: apk.is_active,
            // Other fields like version_code, file_name, s3_key, checksum_sha256 are usually not editable
            // unless you have a specific use case to re-upload. For now, they are read-only.
        });
    }
  }, [apk, dialogOpen]);

  const handleUpdateApk = async () => {
    setLoading(true);
    setError(null);

    try {
      // Send only the fields that are allowed to be updated.
      // version_code, file_name, s3_key, checksum_sha256 are typically not mutable via edit.
      const dataToUpdate = {
        version_name: editedApk.version_name,
        release_notes: editedApk.release_notes,
        is_mandatory: editedApk.is_mandatory,
        is_active: editedApk.is_active,
      };

      await api.put(`/apk_versions/${apk.id}`, dataToUpdate);

      // toast({
      //   title: "APK Version Updated",
      //   description: `Version ${apk.version_name} (${apk.version_code}) has been updated.`,
      // });
      setDialogOpen(false); // Close dialog
      // onApkUpdated(); // Notify parent to refetch data
    } catch (err: any) {
      console.error("Failed to update APK version:", err);
      setError(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {children} {/* This will be the button from your columns */}
      </DialogTrigger>
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
            <Input value={apk.file_size_bytes ? apk.file_size_bytes.toLocaleString() + ' bytes' : ''} readOnly className="col-span-3 bg-gray-100 dark:bg-gray-800" />
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