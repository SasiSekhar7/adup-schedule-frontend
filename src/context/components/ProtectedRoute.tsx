import { ReactNode } from "react";
import { useFeature } from "../hooks/useFeature";
import PlanAccessRequired from "@/pages/PlanAccess";
import { Features } from "../types/subscription";

type FeatureKey = keyof Features;

type Props = {
  feature?: FeatureKey;
  features?: FeatureKey[];
  type?: "boolean" | "limit";
  children: ReactNode;
};

const ProtectedRoute = ({
  feature,
  features,
  type = "boolean",
  children,
}: Props) => {
  const { has, limit, expired, loading } = useFeature();

  // Wait until subscription API finishes
  if (loading) {
    return <div>Loading...</div>;
    // or return <Loading />;
  }

  if (expired) {
    return <PlanAccessRequired type="expired" />;
  }

  // Boolean feature check
  if (type === "boolean") {
    let hasAccess = true;

    if (features && features.length > 0) {
      // Allow if user has ANY one of the features
      hasAccess = features.some((f) => has(f));
    } else if (feature) {
      hasAccess = has(feature);
    }
    
    console.log("hasAccess", hasAccess, features);

    if (!hasAccess) {
      return <PlanAccessRequired type="upgrade" />;
    }
  }

  // Limit-based feature check (only supports single feature)
  if (type === "limit" && feature) {
    const featureLimit = limit(feature);

    if (featureLimit !== "unlimited" && featureLimit <= 0) {
      return <PlanAccessRequired type="upgrade" />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
