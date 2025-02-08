"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Upload } from "lucide-react"

interface AdViewProps {
  ad: {
    ad_id: string
    name: string
    url: string
    duration: number
    client_id: string
  }
}

export default function AdView({ ad }: AdViewProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async () => {
    setIsUploading(true)
    // Simulating upload process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsUploading(false)
    // Here you would typically handle the actual upload process
    console.log("Upload completed")
  }

  const isVideo = ad.url.match(/\.(mp4|webm|ogg)$/)
  const isImage = ad.url.match(/\.(jpeg|jpg|gif|png)$/)

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <strong>Name:</strong> {ad.name}
        </div>
        <div>
          <strong>URL:</strong>{" "}
          <a href={ad.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {ad.url}
          </a>
        </div>
        <div>
          <strong>Duration:</strong> {ad.duration} seconds
        </div>
        <div>
          <strong>Client ID:</strong> {ad.client_id}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden" >
        {isVideo && (
          <video src={ad.url} controls className="w-full max-h-20 object-contain">
            Your browser does not support the video tag.
          </video>
        )}
        {isImage && <img src={ad.url || "/placeholder.svg"} alt={ad.name} className="w-full max-h-96 object-contain" />}
        {!isVideo && !isImage && (
          <div className="bg-gray-100 h-96 flex items-center justify-center text-gray-500">Preview not available</div>
        )}
      </div>

      <div className="flex space-x-4">
        <Button asChild>
          <Link to={`/ads/${ad.ad_id}/edit`}>Edit Ad</Link>
        </Button>
        <Button onClick={handleUpload} disabled={isUploading}>
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload New Version"}
        </Button>
      </div>
    </div>
  )
}

