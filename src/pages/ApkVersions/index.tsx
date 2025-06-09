// src/pages/ApkVersions.tsx
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table"; // Your existing DataTable component

import api from "@/api"; // Your API client
import { ApkVersion, columns } from "./columns";
import AddApkComponent from "./components/AddApkComponent";

interface ApkVersionsResponse {
  apk_versions: ApkVersion[]; // Assuming your API returns an object with an array under 'apk_versions'
}

function ApkVersionsPage() {
  const [data, setData] = useState<ApkVersion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

  const fetchApkVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      // NOTE: This assumes your API for fetching ALL APK versions is protected
      // and requires admin token, as discussed in the backend section.
      // Adjust '/api/v1/apk_versions' if your route is different.
      const response = await api.get<ApkVersionsResponse>('/apk_versions');
      setData(response.apk_versions); // Adjust based on your actual API response structure
    } catch (err: any) {
      console.error("Failed to fetch APK versions:", err);
      setError(err.message || "Failed to load APK versions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApkVersions();
  }, []);

  // Callback to refetch data when an APK is added, edited, or deleted
  const handleDataChange = () => {
    fetchApkVersions();
  };

  return (
    <div className="p-6"> {/* Added padding for better layout */}
      <div className="flex items-center w-full mb-6">
        <div>
          <p className="text-xl font-semibold">APK Versions</p>
          <p className="text-sm text-muted-foreground">
            Manage all Android application package versions.
          </p>
        </div>

        <div className="ml-auto">
          <AddApkComponent onApkAdded={handleDataChange} />
        </div>
      </div>

      {loading && <p className="text-center text-gray-500">Loading APK versions...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <DataTable
          data={data}
          columns={columns} // Pass the callback to columns for actions
          filters={[{ label: "Version Name", value: "version_name" }]}
        />
      )}
    </div>
  );
}

export default ApkVersionsPage;