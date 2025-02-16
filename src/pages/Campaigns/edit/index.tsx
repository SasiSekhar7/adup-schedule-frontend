"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Campaign } from "@/types/campaign"
import type { Coupon } from "@/types/coupon"
import CouponManager from "../campaign-manager"
import { useNavigate, useParams } from "react-router-dom"
import api from "@/api"
import QRCode from "qrcode"
import { Copy, Download, Share2 } from "lucide-react"

export default function EditCampaignPage() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState<Campaign | null>(null)
    const { campaign_id } = useParams()
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

    const baseUrl = "https://feedback.adup.live"
    const utmParams = `utm_source=qrcode&utm_medium=ad_screen&utm_campaign=qr_in_ads`
    const campaignUrl = `${baseUrl}?campaign_id=${campaign_id}&${utmParams}`
    
    // Updated Copy Link (with UTM parameters)
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(campaignUrl)
            alert("Link copied to clipboard!")
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }
    
    // Updated Share Link (with UTM parameters)
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Campaign QR Code",
                    url: campaignUrl,
                })
            } catch (error) {
                console.error("Error sharing:", error)
            }
        } else {
            alert("Sharing is not supported on this browser.")
        }
    }
    
    const handleDownload = () => {
      const link = document.createElement("a")
      link.href = campaignUrl
      link.download = `campaign-${campaign_id}.png`
      link.click()
  }

    // Updated Input (with UTM parameters)
    
    useEffect(() => {
        const loadCampaign = async () => {
            if (campaign_id) {
                const campaignResponse = await api.get(`/campaign/get/${campaign_id}`)
                setFormData(campaignResponse.campaign)

                // Generate QR Code
                QRCode.toDataURL(campaignUrl, { width: 300 }, (err: any, url: string) => {
                  if (!err) setQrCodeUrl(url)
                  else console.error("QR Code Generation Error:", err)
              })
            }
        }
        loadCampaign()
    }, [campaign_id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await api.post(`/campaign/update`, formData)
        navigate("/campaigns")
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => (prev ? { ...prev, [name]: value } : null))
    }

    const handleCheckboxChange = (name: string) => {
        setFormData((prev) => (prev ? { ...prev, [name]: !prev[name as keyof typeof prev] } : null))
    }

    const handleAddCoupon = (coupon: Omit<Coupon, "coupon_id">) => {
        setFormData((prev) =>
            prev
                ? {
                      ...prev,
                      coupons: [...prev.coupons, { ...coupon, coupon_id: Date.now().toString() }],
                  }
                : null
        )
    }

    const handleDeleteCoupon = (couponId: string) => {
        setFormData((prev) =>
            prev
                ? {
                      ...prev,
                      coupons: prev.coupons.filter((coupon) => coupon.coupon_id !== couponId),
                  }
                : null
        )
    }

    const handleUpdateCoupon = (updatedCoupon: Coupon) => {
        setFormData((prev) =>
            prev
                ? {
                      ...prev,
                      coupons: prev.coupons.map((coupon) =>
                          coupon.coupon_id === updatedCoupon.coupon_id ? updatedCoupon : coupon
                      ),
                  }
                : null
        )
    }

    if (!formData) {
        return <div>Loading...</div>
    }

    return (
        <div className="container mx-auto py-10 flex flex-row h-full w-full space-x-4">
          <div>
          <h1 className="text-3xl font-bold mb-6">Edit Campaign</h1>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                <div>
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="requires_phone"
                        checked={formData.requires_phone}
                        onCheckedChange={() => handleCheckboxChange("requires_phone")}
                    />
                    <Label htmlFor="requires_phone">Requires Phone</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="requires_questions"
                        checked={formData.requires_questions}
                        onCheckedChange={() => handleCheckboxChange("requires_questions")}
                    />
                    <Label htmlFor="requires_questions">Requires Questions</Label>
                </div>

                {/* Base URL Input and QR Code */}
            
                <CouponManager
                    coupons={formData.coupons}
                    onAddCoupon={handleAddCoupon}
                    onDeleteCoupon={handleDeleteCoupon}
                    onUpdateCoupon={handleUpdateCoupon}
                />
                <Button type="submit">Update Campaign</Button>
            </form>
          </div>
   
            <div className="flex flex-col items-center space-x-4 border  ">
            <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-xl">
            <Label className="text-lg font-semibold">Scan to Visit Campaign</Label>
            
            {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 rounded-lg  " />}

            <div className="flex space-x-3">
                <Button variant="outline" onClick={handleCopyLink}>
                    <Copy className="w-5 h-5 mr-2" /> Copy Link
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                    <Download className="w-5 h-5 mr-2" /> Download
                </Button>
                <Button variant="outline" onClick={handleShare}>
                    <Share2 className="w-5 h-5 mr-2" /> Share
                </Button>
            </div>

            <Input value={campaignUrl} readOnly className="text-center" />
            </div>
               
                </div>

        </div>
    )
}
