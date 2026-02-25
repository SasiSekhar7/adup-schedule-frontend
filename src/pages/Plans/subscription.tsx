import api from "@/api";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

function SubscriptionInfo() {
  const [data, setData] = useState<any>(null);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await api.get(`/subscription/${userId}`);
    setData(res.data);
  };

  if (!data) return null;

  return (
    <Card className="m-6">
      <CardContent className="p-6 space-y-2">
        <h2 className="text-xl font-semibold">
          Current Plan: {data.Tier?.name}
        </h2>

        <p>Status: {data.subscription_status}</p>

        <p>
          Expires On:{" "}
          {data.subscription_expiry
            ? new Date(data.subscription_expiry).toLocaleDateString()
            : "No Expiry"}
        </p>
      </CardContent>
    </Card>
  );
}

export default SubscriptionInfo;
