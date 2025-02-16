import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Link } from "react-router-dom"
import CampaignList from "./campaign-list"

export default function CampaignsPage() {
  return (
    <div className="container mx-auto ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-md font-bold">Campaigns</h1>
        <Link to="/campaigns/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Campaign
          </Button>
        </Link>
      </div>
      <CampaignList />
    </div>
  )
}

