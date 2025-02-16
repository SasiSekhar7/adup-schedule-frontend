
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from "lucide-react"
import { Campaign } from "@/types/campaign"
import { Link } from "react-router-dom"
import api from "@/api"
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog"


export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading , setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const fetchData = async () => {
    const data = await api.get('/campaign/all')
        setCampaigns( data.campaigns)

}
  useEffect(() => {

    fetchData();
  }, [])

const handleDelete = async (campaign_id: string) => {
  setLoading(true);
try {
  await api.post(`/campaign/delete/${campaign_id}`);
  setLoading(false);
  setOpen(false);
  fetchData();
} catch (error) {
  console.log(error)
  setLoading(false);
}



}
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {campaigns?.map((campaign) => (
        <Card key={campaign.campaign_id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{campaign.name}</CardTitle>
              <div className="flex space-x-2">
              <Link to={`/campaigns/edit/${campaign.campaign_id}`}>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button variant="outline" size="icon">
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                Are you sure?
                <DialogFooter>
                <Button onClick={()=>handleDelete(campaign.campaign_id)} disabled={loading}>Delete Campaign</Button>
                
                </DialogFooter>
            </DialogContent>
        </Dialog>
              </div>
     
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{campaign.description}</p>
            <div className="flex gap-2 mb-4">
              <Badge variant={campaign.requires_phone ? "default" : "secondary"}>
                {campaign.requires_phone ? "Phone Required" : "No Phone Required"}
              </Badge>
              <Badge variant={campaign.requires_questions ? "default" : "secondary"}>
                {campaign.requires_questions ? "Questions Required" : "No Questions Required"}
              </Badge>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Coupons:</h4>
              {campaign.coupons?.length > 0 ? (
                <ul className="list-disc list-inside">
                  {campaign.coupons.map((coupon) => (
                    <li key={coupon.coupon_id} className="text-sm">
                      {coupon.coupon_code} - {coupon.coupon_description}
                      {!coupon.is_active && <span className="text-red-500"> (Inactive)</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No coupons available</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

