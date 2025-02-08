"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash, Upload } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import api from "@/api"

export interface AdData {
  ad_id?: string
  name: string
  url: string
  duration: number
  client_id: string
}

interface AdManagerProps {
  initialData?: AdData
  isEditing: boolean
}

export default function AdManager({ initialData, isEditing }: AdManagerProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AdData>(
    initialData || {
      name: "",
      url: "",
      duration: 0,
      client_id: "",
    },
  )
  const [file, setFile] = useState<File | null>();
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
    //   const result = await handleAdSubmit(formData)
    //   if (result.success) {
    //     router.push(`/ads/${result.ad_id}`)
    //   } else {
    //     console.error(result.error)
    //   }
    } catch (error) {
      console.error("Failed to submit ad", error)
    }
  }

  const handleUpload = async () => {
    setIsUploading(true)
    try {
        const fileData = new FormData();
        if(!file) throw('No FIle')
        fileData.append('file', file);

       await api.post(`/ads/file/edit/${formData.ad_id}`, fileData)

       
    } catch (error) {
    setIsUploading(false)
        console.log(error);
    }
    setIsUploading(false)
    console.log("Upload completed")
  }
  const cleanUrl = formData.url.split("?")[0]; // Remove query parameters

  const isVideo = /\.(mp4|webm|ogg)$/i.test(cleanUrl);
  const isImage = /\.(jpeg|jpg|gif|png)$/i.test(cleanUrl);
  
  const handleDelete = async()=>{
    setLoading(true)
      try {
        await api.post(`/ads/delete/${formData.ad_id}`);

        setLoading(false)
       navigate('/ads')

      } catch (error) {
        setLoading(false)

        console.log(error)
      }
  }
  return (
    <div className="flex h-screen">
      <div className="w-2/3 p-6 overflow-auto">
        <Card>
          <CardHeader className="flex flex-row items-center">
            <CardTitle>{isEditing ? "Edit Ad" : "Ad Details"}</CardTitle>
            <div className="flex items-center space-x-2 ml-auto">
            
            <Dialog> 
                    <DialogTrigger>
                      {isEditing &&
                    <Button variant="destructive">
            <Trash/>

                Delete Ad 
            </Button>
}
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                            Are you sure you want to delete the ad?

                            </DialogTitle>
                        </DialogHeader>
                        
                        <DialogFooter>
                        <Button 
      onClick={handleDelete} 
                        disabled={loading}
                        > 
                    Delete
            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
         

            {isEditing ? (
              <Button type="submit" onClick={onSubmit}>
                Save Changes
              </Button>
            ) : (
              <Button onClick={() => navigate(`/ads/${formData.ad_id}/edit`)} >Edit</Button>
            )}
            </div>
          
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  readOnly={!isEditing}
                />
              </div>
              {/* <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  value={formData.url}
                  onChange={handleChange}
                  required
                  readOnly={!isEditing}
                />
              </div> */}
              <div>
                <Label htmlFor="duration">Duration (in seconds)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="client_id">Client ID</Label>
                <Input
                  id="client_id"
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  required
                  readOnly
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
  
            {isEditing&&
                <Dialog> 
                    <DialogTrigger>
                    <Button> 
                    <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload New File"}
            </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                            Upload image or video file of duration (10s)

                            </DialogTitle>
                        </DialogHeader>
                        
                        <Input type="file" onChange={(e)=>setFile(e.target.files?.[0])}/>
                        <DialogFooter>
                        <Button 
      onClick={handleUpload} disabled={isUploading}
                        
                        > 
                    <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              }
            
          </CardFooter>
        </Card>
      </div>

      <div className="w-1/3 bg-gray-100 p-6 sticky top-0 h-[82vh]">
        <div className="h-full flex items-center justify-center">
          <div className="w-full max-w-[300px] aspect-[9/16] bg-white shadow-lg rounded-lg overflow-hidden">
            {isVideo && (
              <video src={formData.url} controls className="w-full h-full object-cover">
                Your browser does not support the video tag.
              </video>
            )}
            {isImage && (
              <img
                src={formData.url || "/placeholder.svg"}
                alt={formData.name}
                className="w-full h-full object-cover"
              />
            )}
            {!isVideo && !isImage && (
              <div className="w-full h-full flex items-center justify-center text-gray-500">Preview not available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

