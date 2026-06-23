import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useFeature } from "../hooks/useFeature";

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
    return <Navigate to="/" replace />;
  }

  if (type === "boolean" && !has(feature)) {
    return <Navigate to="/" replace />;
  }

  if (type === "limit" && limit(feature) <= 0) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
