import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useParams } from "react-router-dom";
import api from "@/api";
import AdManager, { AdData } from "./components/AdManager";

const AdPage = ({ edit }: { edit: boolean }) => {
  const { ad_id } = useParams();
  const [ad, setAd] = useState<AdData>();
  const [adName, setAdName] = useState();
  const [adUrl, setAdUrl] = useState();
  const [duration, setDuration] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/ads/${ad_id}`);
        console.log(response);

        setAd({
          ad_id: ad_id,
          name: response.data.name,
          url: response.data.url,
          duration: response.data.duration,
          client_id: response.data.client_id,
          status: response.data.status || "pending",
        });
      } catch {}
    };
    fetchData();
  }, []);

  // Save changes to the ad (assumes there's an API)
  const handleSave = async () => {
    // Call your API to save changes (e.g., PUT request to /api/ads)
    // nz.push(`/ads/${ad.ad_id}`); // Redirect after save
  };

  return (
    <div>
      {ad ? (
        <AdManager isEditing={edit ? edit : false} initialData={ad} />
      ) : (
        <div>Loading....</div>
      )}
    </div>
  );
};

export default AdPage;
