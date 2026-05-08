// types/subscription.ts
import api from "@/api";
import { createContext, useContext, useEffect, useState } from "react";
import { Subscription } from "./types/subscription";

// context/SubscriptionContext.tsx

type SubscriptionContextType = {
  subscription: Subscription | null;
  loading: boolean;
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  loading: true,
});

export const SubscriptionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await api.get<Subscription>("/subscription/my_active");
        console.log("Subscription:", res.data);
        setSubscription(res.data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  return (
    <SubscriptionContext.Provider value={{ subscription, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
