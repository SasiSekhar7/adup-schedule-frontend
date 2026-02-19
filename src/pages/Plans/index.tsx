import api from "@/api";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Tier {
  tier_id: string;
  name: string;
  description: string;
  price: number;
  storage_limit_bytes: string; // comes as string from backend
  max_devices: number;
  max_ads: number;
}

function Plans() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [currentTierId, setCurrentTierId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchTiers();
    fetchUserSubscription();
  }, []);

  // 🔹 Fetch All Plans
  const fetchTiers = async () => {
    try {
      const response = await api.get("/tiers");

      // console.log(response);
      if (Array.isArray(response)) {
        setTiers(response);
      } else {
        setTiers([]);
      }
    } catch (error) {
      toast.error("Failed to load plans");
    }
  };

  // 🔹 Fetch Current User Plan
  const fetchUserSubscription = async () => {
    try {
      const response = await api.get(`/subscription`);
      setCurrentTierId(response.tier_id);
    } catch (error) {
      console.log("Subscription not found");
    }
  };

  // 🔹 Purchase Plan

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-500 to-orange-400 p-10">
      <h1 className="text-3xl font-bold text-white text-center mb-10">
        Choose Your Plan
      </h1>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {tiers?.map((tier) => {
          const isCurrent = currentTierId === tier.tier_id;
          const isPopular = tier.name === "Premium";

          return (
            <Card
              key={tier.tier_id}
              className={`rounded-2xl shadow-xl transition transform hover:scale-105 ${
                isPopular ? "border-4 border-blue-500" : ""
              }`}
            >
              <CardContent className="p-8 text-center space-y-4">
                {isPopular && (
                  <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full inline-block">
                    Popular
                  </div>
                )}

                <h2 className="text-2xl font-semibold">{tier.name}</h2>

                <p className="text-4xl font-bold">
                  ₹{tier.price}
                  <span className="text-sm font-normal"> /month</span>
                </p>

                <p className="text-gray-600">{tier.description}</p>

                <div className="space-y-1 text-sm text-gray-700">
                  <p>
                    {(Number(tier.storage_limit_bytes) / 1073741824).toFixed(0)}{" "}
                    GB Storage
                  </p>
                  <p>{tier.max_devices} Devices</p>
                  <p>{tier.max_ads} Ads</p>
                </div>

                {isCurrent && (
                  <Button disabled className="w-full mt-4 bg-green-500">
                    Current Plan
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default Plans;
