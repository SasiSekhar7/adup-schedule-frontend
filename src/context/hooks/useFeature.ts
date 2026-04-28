import { useSubscription } from "../SubscriptionContext";
import { hasFeature, getLimit, isExpired } from "../utils/featureAccess";
import { Features } from "../types/subscription";

export const useFeature = () => {
  const { subscription } = useSubscription();

  return {
    has: (feature: keyof Features) => hasFeature(subscription, feature),

    limit: (key: keyof Features) => getLimit(subscription, key),

    expired: isExpired(subscription),

    subscription,
  };
};
