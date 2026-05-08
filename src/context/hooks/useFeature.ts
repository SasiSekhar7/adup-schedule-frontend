import { useSubscription } from "../SubscriptionContext";
import { hasFeature, getLimit, isExpired } from "../utils/featureAccess";
import { Features } from "../types/subscription";
import { getRole } from "@/helpers";

export const useFeature = () => {
  const { subscription } = useSubscription();
  const role = getRole();

  const isAdmin = role === "Admin";
  const isClient = role === "Client";
  return {
    role,
    isAdmin,
    isClient,
    // has: (feature: keyof Features) => hasFeature(subscription, feature),
    has: (feature: keyof Features) => {
      if (isAdmin) return true; // admin override
      return hasFeature(subscription, feature);
    },
    // limit: (key: keyof Features) => getLimit(subscription, key),
    limit: (key: keyof Features) => {
      if (isAdmin) return Infinity; // admin unlimited
      return getLimit(subscription, key);
    },

    // expired: isExpired(subscription),
    expired: isAdmin ? false : isExpired(subscription),

    subscription,
  };
};
