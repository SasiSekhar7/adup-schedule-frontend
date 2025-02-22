
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import api from "@/api";

export default function InstallPage() {
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Fetch APK download URL when component mounts
  useEffect(() => {
    const fetchDownloadUrl = async () => {
      try {
        const response = await api.get("/download-apk");
        setDownloadUrl(response.url);
        
      } catch (error) {
        console.error("Error fetching APK URL:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloadUrl();
  }, []);

  // Handle APK download
  const handleDownload = () => {
    if (!downloadUrl) return;
    
    setDownloading(true);
    
    // Create an invisible link and trigger download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", "app.apk"); // Optional
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
    setDownloading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Download & Register</h1>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : downloadUrl ? (
        <div className="flex flex-col items-center gap-4">
          <Button onClick={handleDownload} disabled={downloading}>
            {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Install APK"}
          </Button>
          <Button variant="outline">Register</Button>
        </div>
      ) : (
        <p className="text-red-500">Failed to load APK link.</p>
      )}
    </div>
  );
}

