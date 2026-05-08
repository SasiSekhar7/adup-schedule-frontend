import api from "@/api";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Monitor,
  Smartphone,
  Building2,
  Hash,
  Tv,
  MessageSquare,
  ShieldCheck,
  Image,
  LayoutGrid,
  Sparkles,
  Clock3,
  Layers3,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0 },
};

function DeviceGroupDetails() {
  const { groupId } = useParams();

  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchGroup = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/device/fetch-group-details/${groupId}`);

      setGroup(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-52 rounded-[32px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-36 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-muted-foreground">
        Group not found
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-4 md:p-7">
      {/* HERO */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden  border border-white/40 bg-gray-50"
      >
        {/* Glow */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 h-72 w-72 bg-white/10 blur-3xl rounded-full" />
          <div className="absolute -bottom-20 left-0 h-60 w-60 bg-cyan-300/20 blur-3xl rounded-full" />
        </div>

        {/* Grid */}
        {/* <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:40px_40px]" /> */}

        <div className="relative z-10 p-7 md:p-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
          {/* Left */}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-black mb-4">
              <Sparkles className="h-4 w-4" />
              <p className="uppercase tracking-[0.35em] text-xs font-medium">
                Device Group
              </p>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-black">
              {group.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Badge className="bg-gray-100 hover:bg-white/20 border border-white/20 text-black backdrop-blur-xl px-4 py-1 rounded-full">
                {group.orientation}
              </Badge>

              <Badge className="bg-gray-100 hover:bg-white/20 border border-white/20 text-black backdrop-blur-xl px-4 py-1 rounded-full">
                {group.device_count} Devices
              </Badge>

              <Badge className="bg-emerald-400 text-black font-semibold border-0 px-4 py-1 rounded-full">
                Active
              </Badge>
            </div>

            <div className="flex flex-wrap gap-6 mt-8 text-black text-sm">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                {group.reg_code}
              </div>

              <div className="flex items-center gap-2">
                <Layers3 className="h-4 w-4" />
                {group.current_content_type || "No Content"}
              </div>

              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                Updated recently
              </div>
            </div>
          </div>

          {/* Right */}
          <motion.div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              {/* <div className="absolute inset-0 bg-gray-50 blur-3xl rounded-full" /> */}

              <div className="relative h-52 w-52   flex items-center justify-center">
                {group.orientation === "portrait" ? (
                  <Smartphone
                    className="h-28 w-28 text-black"
                    strokeWidth={1.5}
                  />
                ) : (
                  <Monitor className="h-28 w-28 text-black" strokeWidth={1.5} />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* STATS */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-7"
      >
        {/* <InfoCard
          icon={<Building2 />}
          title="Client"
          value={group.Client?.name || "N/A"}
        /> */}

        <InfoCard icon={<Hash />} title="License Key" value={group.reg_code} />

        <InfoCard icon={<Tv />} title="Devices" value={group.device_count} />

        <InfoCard
          icon={group.orientation === "portrait" ? <Smartphone /> : <Monitor />}
          title="Orientation"
          value={group.orientation}
        />
        {/* NEW */}
        <InfoCard
          icon={<Clock3 />}
          title="Last Pushed"
          value={
            group.last_pushed
              ? new Date(group.last_pushed).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A"
          }
        />

        {/* NEW */}
        <InfoCard
          icon={<Layers3 />}
          title="Max Schedule Days"
          value={group.max_days_schedules || 0}
        />
      </motion.div>

      {/* FEATURES + MESSAGE */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 gap-6 mt-7"
      >
        {/* FEATURES */}
        <Card className="xl:col-span-2 border border-slate-200/70 shadow-sm bg-white">
          <CardContent className="p-7">
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <LayoutGrid className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Group Features
                  </h2>
                  <p className="text-sm text-slate-500">
                    Available features in this device group
                  </p>
                </div>
              </div>
            </div>

            <Separator className="mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <FeatureCard
                title="RCS Enabled"
                enabled={group.rcs_enabled}
                icon={<ShieldCheck />}
              />

              <FeatureCard
                title="Placeholder"
                enabled={group.placeholder_enabled}
                icon={<Image />}
              />

              <FeatureCard
                title="Logo Enabled"
                enabled={group.logo_enabled}
                icon={<Building2 />}
              />
            </div>
          </CardContent>
        </Card>

        {/* MESSAGE */}
        {/* <Card className="rounded-[30px] border border-slate-200/70 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-7">
            <div className="flex items-center gap-3 mb-7">
              <div className="h-11 w-11 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                <MessageSquare className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Group Message
                </h2>

                <p className="text-sm text-slate-500">
                  Message visible for devices
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 min-h-[220px] flex items-center text-slate-700 leading-relaxed">
              {group.message || (
                <div className="text-center w-full">
                  <MessageSquare className="mx-auto mb-3 h-10 w-10 text-slate-300" />

                  <p className="font-medium text-slate-500">
                    No message available
                  </p>

                  <p className="text-sm text-slate-400 mt-1">
                    This group currently has no active message
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card> */}
      </motion.div>
    </div>
  );
}

function InfoCard({ icon, title, value }: any) {
  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card className=" border border-slate-200/70 bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 text-indigo-600 flex items-center justify-center shadow-sm">
              {icon}
            </div>

            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h3 className="text-2xl font-black text-slate-900 mt-2 break-all">
            {value}
          </h3>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FeatureCard({ title, enabled, icon }: any) {
  return (
    <motion.div
      whileHover={{
        y: -5,
      }}
      className={`relative overflow-hidden rounded-[28px] border p-5 transition-all duration-300 ${
        enabled
          ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="absolute top-0 right-0 h-28 w-28 bg-white/40 blur-3xl rounded-full" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div
            className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm ${
              enabled ? "bg-white text-emerald-600" : "bg-white text-slate-400"
            }`}
          >
            {icon}
          </div>

          <Badge
            className={`rounded-full px-3 py-1 border-0 ${
              enabled
                ? "bg-emerald-500 hover:bg-emerald-500"
                : "bg-slate-400 hover:bg-slate-400"
            }`}
          >
            {enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        <h3 className="mt-7 text-lg font-bold text-slate-900">{title}</h3>

        <p className="mt-1 text-sm text-slate-500">
          {enabled
            ? "This feature is currently active"
            : "This feature is currently disabled"}
        </p>
      </div>
    </motion.div>
  );
}

export default DeviceGroupDetails;
