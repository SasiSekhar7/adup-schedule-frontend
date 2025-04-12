import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import api from "@/api";

export default function InstallPage() {
  const [apkUrl, setApkUrl] = useState(null);
  const [wgtUrl, setWgtUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingApk, setDownloadingApk] = useState(false);
  const [downloadingWgt, setDownloadingWgt] = useState(false);

  useEffect(() => {
    const fetchDownloadUrls = async () => {
      try {
        const [apkRes, wgtRes] = await Promise.all([
          api.get("/download-apk"),
          api.get("/download-wgt"),
        ]);

        setApkUrl(apkRes.url);
        setWgtUrl(wgtRes.url);
      } catch (error) {
        console.error("Error fetching download URLs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloadUrls();
  }, []);

  const handleDownload = (url, filename, setDownloading) => {
    if (!url) return;

    setDownloading(true);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
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
      ) : apkUrl || wgtUrl ? (
        <div className="flex flex-col items-center gap-4">
          {apkUrl && (
            <Button
              onClick={() => handleDownload(apkUrl, "app.apk", setDownloadingApk)}
              disabled={downloadingApk}
            >
              {downloadingApk ? <Loader2 className="w-5 h-5 animate-spin" /> : "Install APK"}
            </Button>
          )}

          or 
          
          {wgtUrl && (
            <Button
              onClick={() => handleDownload(wgtUrl, "app.wgt", setDownloadingWgt)}
              disabled={downloadingWgt}
            >
              {downloadingWgt ? <Loader2 className="w-5 h-5 animate-spin" /> : "Install WGT"}
            </Button>
          )}

          {/* <Button variant="outline">Register</Button> */}
        </div>
      ) : (
        <p className="text-red-500">Failed to load download links.</p>
      )}
    </div>
  );
}
