// types/subscription.ts

export type Features = {
  LIVE_IN_LAYOUT: boolean;
  LIVE_STREAMING: boolean;
  PROOF_OF_PLAY: boolean;

  MAX_ADS: number;
  MAX_DEVICES: number;
  MAX_LAYOUTS: number;
  STORAGE_LIMIT: number;
};

export type Tier = {
  tier_id: string;
  name: string;
  description: string | null;
  price: number;
  billing_cycle: string;
};

export type Subscription = {
  subscription_id: string;
  client_id: string;
  tier_id: string;
  status: "trial" | "active" | "expired";
  billing_cycle: string;
  start_date: string;
  end_date: string;
  is_trial: boolean;
  no_of_months: number;
  features_cache: Features;
  Tier: Tier;
};
