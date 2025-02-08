"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AdFormProps {
  initialData?: {
    ad_id: string
    name: string
    url: string
    duration: number
    client_id: string
  }
}

export default function AdForm({ initialData }: AdFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      url: "",
      duration: 0,
      client_id: "",
    },
  )
  const [previewUrl, setPreviewUrl] = useState(initialData?.url || "")

  useEffect(() => {
    setPreviewUrl(formData.url)
  }, [formData.url])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
    //   const result = await handleAdSubmit(formData)
    //   if (result.success) {
        // router.push(`/ads/${result.ad_id}`)
    //   } else {
        // Handle error
        // console.error(result.error)
    //   }
    } catch (error) {
      console.error("Failed to submit ad", error)
    }
  }

  const isVideo = previewUrl.match(/\.(mp4|webm|ogg)$/)
  const isImage = previewUrl.match(/\.(jpeg|jpg|gif|png)$/)

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="url">URL</Label>
          <Input id="url" name="url" type="url" value={formData.url} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="duration">Duration (in seconds)</Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="client_id">Client ID</Label>
          <Input id="client_id" name="client_id" value={formData.client_id} onChange={handleChange} required />
        </div>
        <Button type="submit">{initialData ? "Update Ad" : "Create Ad"}</Button>
      </form>

      <div className="border rounded-lg overflow-hidden">
        {isVideo && (
          <video src={previewUrl} controls className="w-full max-h-96 object-contain">
            Your browser does not support the video tag.
          </video>
        )}
        {isImage && (
          <img src={previewUrl || "/placeholder.svg"} alt="Ad Preview" className="w-full max-h-96 object-contain" />
        )}
        {!isVideo && !isImage && previewUrl && (
          <div className="bg-gray-100 h-96 flex items-center justify-center text-gray-500">Preview not available</div>
        )}
        {!previewUrl && (
          <div className="bg-gray-100 h-96 flex items-center justify-center text-gray-500">
            Enter a URL to see a preview
          </div>
        )}
      </div>
    </div>
  )
}

