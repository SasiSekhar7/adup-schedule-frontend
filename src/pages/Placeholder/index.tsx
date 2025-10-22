import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from "@/api";

const PlaceholderEditor = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const fetchImage = async () => {
    try {
      const res = await api.get("/schedule/placeholder");
      setImageUrl(res.url);
    } catch (error) {
      console.error("Error fetching image:", error);
    } finally {
      setLoading(false);
    }
  };
  // Fetch the latest placeholder image URL
  useEffect(() => {
    fetchImage();
  }, []);

  // Handle image upload
  const handleImageUpload = async () => {
    setUploading(true);
    try {
      const fileData = new FormData();
      if (!file) throw "No FIle";
      fileData.append("file", file);
      fileData.append("isMultipartUpload", "false");

      await api.post(`/schedule/change-placeholder`, fileData);
      fetchImage();
    } catch (error) {
      setUploading(false);
      console.log(error);
    }
    setUploading(false);
    console.log("Upload completed");
  };

  return (
    <Card className="p-4 max-w-md mx-auto">
      <CardContent className="flex flex-col items-center gap-4">
        <h2 className="text-xl font-semibold">Edit Placeholder Image</h2>

        {loading ? (
          <div>Loading..</div>
        ) : (
          <img
            src={imageUrl}
            alt="Placeholder"
            className="rounded-lg w-48 h-80 object-cover border"
          />
        )}

        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0])}
        />

        <Button
          disabled={uploading}
          className="w-full"
          onClick={handleImageUpload}
        >
          {uploading ? "Uploading..." : "Change Image"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlaceholderEditor;
