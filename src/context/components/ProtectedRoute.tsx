import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useFeature } from "../hooks/useFeature";
import PlanAccessRequired from "@/pages/PlanAccess";

type Props = {
  feature: keyof import("../types/subscription").Features;
  type?: "boolean" | "limit";
  children: ReactNode;
};

const ProtectedRoute = ({ feature, type = "boolean", children }: Props) => {
  const { has, limit, expired, loading } = useFeature();

  // Wait until subscription API finishes
  if (loading) {
    return <div>Loading...</div>;
    // or return <Loading />;
  }

  if (expired) {
    return <PlanAccessRequired type="expired" />;
  }

  if (type === "boolean" && !has(feature)) {
    return <PlanAccessRequired type="upgrade" />;
  }

  const featureLimit = limit(feature);
  if (type === "limit" && featureLimit !== "unlimited" && featureLimit <= 0) {
    return <PlanAccessRequired type="upgrade" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
