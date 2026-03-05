"use client";

import { useState, useEffect } from "react";
import api from "@/api"; // your axios instance
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

import { Radio, ChevronRight, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { streamProviders } from "./components/providers";
import { useNavigate } from "react-router-dom";
import { getRole } from "@/helpers";

const providerColors: Record<string, string> = {
  dacast: "bg-[#0066FF]",
  "vimeo-livestream": "bg-[#1AB7EA]",
  wowza: "bg-[#F56B23]",
  restream: "bg-[#F23A52]",
  castr: "bg-[#6C3FC5]",
};

export default function StreamProvidersPage() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);

  const [userRole, setUserRole] = useState<string | null>(null);

  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    const role = getRole();
    setUserRole(role);
  }, []);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await api.get("/streaming/provider");
      console.log("Providers:", res.data);

      setProviders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createProvider = async () => {
    try {
      setLoading(true);

      const response = await api.post("/streaming/provider", {
        name,
        api_key: apiKey,
      });

      console.log(response.data);

      setOpen(false);
      setName("");
      setApiKey("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Stream Providers
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your live streaming providers and channels
            </p>
          </div>

          {userRole === "Admin" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="size-4" />
                  Create Provider
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                  <DialogTitle>Create Streaming Provider</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label>Provider Name</Label>
                    <Input
                      placeholder="Dacast Provider"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>API Key</Label>
                    <Input
                      placeholder="Enter API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    onClick={createProvider}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Creating..." : "Create Provider"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/*<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {streamProviders.map((provider) => {
            const activeChannels = provider.channels.filter(
              (c) => c.status === "active" || c.status === "live",
            ).length;
            const liveChannels = provider.channels.filter(
              (c) => c.status === "live",
            ).length;

            return (
              <button
                key={provider.id}
                onClick={() => navigate(`/stream-providers/${provider.slug}`)}
                className="group relative flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-foreground/20 text-left"
              >
                <div className="flex items-start gap-4 p-5">
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-primary-foreground ${providerColors[provider.id] || "bg-primary"}`}
                  >
                    {provider.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">
                        {provider.name}
                      </h3>
                      <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {provider.description}
                    </p>
                  </div>
                </div>

                <div className="border-t px-5 py-3 flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="text-[11px] bg-muted text-muted-foreground"
                  >
                    {provider.channels.length} channels
                  </Badge>
                  {liveChannels > 0 && (
                    <Badge className="text-[11px] bg-emerald-100 text-emerald-700 border-0">
                      <span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {liveChannels} live
                    </Badge>
                  )}
                  {activeChannels > 0 && (
                    <Badge
                      variant="outline"
                      className="text-[11px] text-foreground"
                    >
                      {activeChannels} active
                    </Badge>
                  )}
                </div>

                <div className="border-t px-5 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {provider.features.slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="inline-block rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {f}
                      </span>
                    ))}
                    {provider.features.length > 3 && (
                      <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        +{provider.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>*/}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <button
              key={provider.provider_id}
              onClick={() =>
                navigate(`/stream-providers/${provider.provider_type}`)
              }
              className="group relative flex flex-col rounded-xl border bg-card shadow-sm hover:shadow-md text-left"
            >
              <div className="flex items-start gap-4 p-5">
                <div
                  className={`flex size-12 items-center justify-center rounded-lg text-lg font-bold text-white ${
                    providerColors[provider.provider_type] || "bg-primary"
                  }`}
                >
                  {provider.provider_type?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{provider.name}</h3>
                    <ChevronRight className="ml-auto size-4 opacity-0 group-hover:opacity-100" />
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    {provider.api_base_url}
                  </p>
                </div>
              </div>

              <div className="border-t px-5 py-3 flex items-center gap-2">
                <Badge variant="secondary" className="text-[11px]">
                  {provider.provider_type}
                </Badge>

                {provider.is_active && (
                  <Badge className="text-[11px] bg-emerald-100 text-emerald-700">
                    Active
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
