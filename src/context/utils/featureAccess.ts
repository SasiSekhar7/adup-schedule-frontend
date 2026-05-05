// utils/featureAccess.ts

import { Subscription } from "../types/subscription";

export const hasFeature = (
  subscription: Subscription | null,
  feature: keyof Subscription["features_cache"],
): boolean => {
  if (!subscription) return false;

  return Boolean(subscription.features_cache?.[feature]);
};

export const getLimit = (
  subscription: Subscription | null,
  key: keyof Subscription["features_cache"],
): number => {
  if (!subscription) return 0;

  const value = subscription.features_cache?.[key];
  return typeof value === "number" ? value : 0;
};

export const isExpired = (subscription: Subscription | null): boolean => {
  if (!subscription?.end_date) return false;

  return new Date(subscription.end_date) < new Date();
};
