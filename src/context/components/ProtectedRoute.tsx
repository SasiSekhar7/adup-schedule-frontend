// components/ProtectedRoute.tsx

import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useFeature } from "../hooks/useFeature";

type Props = {
  feature: keyof import("../types/subscription").Features;
  children: ReactNode;
};

const ProtectedRoute = ({ feature, children }: Props) => {
  const { has, expired } = useFeature();

  if (expired) return <Navigate to="/" />;

  if (!has(feature)) return <Navigate to="/" />;

  return <>{children}</>;
};

export default ProtectedRoute;
