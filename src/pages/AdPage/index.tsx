import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useParams } from "react-router-dom";
import api from "@/api";

const AdPage = () => {
  const {ad_id} = useParams();
  useEffect(()=>{
    const fetchData = async()=>{
        try{
            const data  = await api.get(`/ads/${ad_id}`);
            setAdName(data.data?.name)
            setAdUrl(data.data?.url)
            setDuration(data.data?.duration)
        }catch{

        }
    }
    fetchData()
  },[])
  const [ad, setAd] = useState();
  const [adName, setAdName] = useState();
  const [adUrl, setAdUrl] = useState();
  const [duration, setDuration] = useState();


  // Save changes to the ad (assumes there's an API)
  const handleSave = async () => {
    const updatedAd = {
      ...ad,
      name: adName,
      url: adUrl,
      duration: parseInt(duration),
    };

    // Call your API to save changes (e.g., PUT request to /api/ads)
    await fetch(`/api/ads/${ad.ad_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedAd),
    });

    // nz.push(`/ads/${ad.ad_id}`); // Redirect after save
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Edit Ad: {adName}</h1>

      <div className="flex flex-col space-y-2">
        <label className="text-sm">Ad Name</label>
        <input
          type="text"
          value={adName}
          onChange={(e) => setAdName(e.target.value)}
          className="input"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm">Ad URL</label>
        <input
          type="text"
          value={adUrl}
          onChange={(e) => setAdUrl(e.target.value)}
          className="input"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm">Duration (in seconds)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="input"
        />
      </div>

      <Button onClick={handleSave} className="bg-blue-500 text-white">
        Save Changes
      </Button>
    </div>
  );
};

export default AdPage;
