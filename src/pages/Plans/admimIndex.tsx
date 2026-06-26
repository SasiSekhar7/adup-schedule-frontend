import api from "@/api";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Check, X, Trash2, Pencil } from "lucide-react";

function AdminPlans() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [featuresList, setFeaturesList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    name: "",
    description: "",
    price: 0,
    billing_cycle: "monthly",
    is_trial: false,
    features_visible_to_client: true,
    features: {},
  });

  useEffect(() => {
    fetchTiers();
    fetchFeatures();
  }, []);

  const BYTES_IN_GB = 1073741824;

  const bytesToGB = (bytes: any) => {
    if (!bytes) return "";
    return (Number(bytes) / BYTES_IN_GB).toFixed(0);
  };

  const gbToBytes = (gb: any) => {
    if (!gb) return "0";
    return String(Number(gb) * BYTES_IN_GB);
  };

  const [loading, setLoading] = useState(false);

  // FETCH TIERS
  const fetchTiers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tiers_v2/all");
      setTiers(res.data);
    } catch (err) {
      console.log("err", err);
    } finally {
      setLoading(false);
    }
  };

  // FETCH FEATURES MASTER
  const fetchFeatures = async () => {
    const res = await api.get("/features/all");
    setFeaturesList(res.data);
  };

  // OPEN CREATE
  const handleOpenCreate = () => {
    const defaultFeatures: any = {};

    featuresList.forEach((f) => {
      if (isBooleanFeature(f.key)) {
        defaultFeatures[f.key] = false;
      } else {
        defaultFeatures[f.key] = "";
      }
    });
    setEditMode(false);

    setForm({
      name: "",
      description: "",
      price: 0,
      billing_cycle: "monthly",
      is_trial: false,
      features_visible_to_client: true,
      features: defaultFeatures,
    });
    setOpen(true);
  };

  // EDIT
  const handleEdit = (tier: any) => {
    const featureMap: any = {};

    tier.Features?.forEach((f: any) => {
      const val = f.TierFeature?.value ?? f.value;

      if (f.key === "STORAGE_LIMIT") {
        featureMap[f.key] = bytesToGB(val);
      } else {
        featureMap[f.key] = val;
      }
    });

    setForm({
      tier_id: tier.tier_id,
      name: tier.name,
      description: tier.description,
      price: tier.price,
      billing_cycle: tier.billing_cycle,
      is_trial: tier.is_trial,
      features_visible_to_client: tier.features_visible_to_client ?? true,
      features: featureMap,
    });

    setEditMode(true);
    setOpen(true);
  };

  // BUILD FEATURES PAYLOAD
  const buildFeaturesPayload = () => {
    return featuresList.map((feature) => {
      let value = form.features?.[feature.key];

      if (value === undefined || value === "") {
        value = isBooleanFeature(feature.key) ? false : "0";
      }

      if (feature.key === "STORAGE_LIMIT") {
        value = gbToBytes(value);
      }

      return {
        key: feature.key,
        value,
      };
    });
  };

  const validateForm = () => {
    if (!form.name || form.name.trim() === "") {
      toast.error("Plan name is required");
      return false;
    }

    if (form.name.trim().length < 2) {
      toast.error("Plan name must be at least 2 characters");
      return false;
    }

    if (!form.is_trial && (!form.price || Number(form.price) <= 0)) {
      toast.error("Price must be greater than 0");
      return false;
    }

    return true;
  };

  const validateFeatures = () => {
    for (const feature of featuresList) {
      const key = feature.key;
      const value = form.features?.[key];

      if (isBooleanFeature(key)) continue;

      if (!value || Number(value) < 0) {
        toast.error(`${formatFeatureKey(key)} must be greater than 0`);
        return false;
      }
    }

    return true;
  };

  // CREATE / UPDATE
  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!validateFeatures()) return;
    try {
      const payload = {
        name: form.name,
        price: form.price,
        billing_cycle: form.billing_cycle,
        is_trial: form.is_trial,
        features_visible_to_client: form.features_visible_to_client,
        features: buildFeaturesPayload(),
      };

      if (editMode && form.tier_id) {
        await api.put(`/tier_v2/${form.tier_id}/update`, payload);
        toast.success("Plan updated successfully");
      } else {
        await api.post("/tier_v2/create", payload);
        toast.success("Plan created successfully");
      }

      fetchTiers();
      setOpen(false);
    } catch (error: any) {
      toast.error(
        error.message ||
          error.error ||
          error?.response?.data?.message ||
          "Operation failed",
      );
    }
  };

  // DELETE
  const handleDelete = async () => {
    if (!selectedTierId) return;

    try {
      await api.delete(`/tier_v2/${selectedTierId}/delete`);
      toast.success("Plan deactivated");
      fetchTiers();
      setDeleteDialogOpen(false);
      setSelectedTierId(null);
    } catch (error: any) {
      toast.error(
        error.message ||
          error.error ||
          error?.response?.data?.message ||
          "Delete failed",
      );
    }
  };

  // FORMAT UI
  const formatFeatureKey = (key: string) => {
    return key
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const isBooleanFeature = (key: string) => {
    return [
      "LIVE_STREAMING",
      "PROOF_OF_PLAY",
      "LIVE_IN_LAYOUT",
      "MULTI_VIDEO_IN_LAYOUT",
    ].includes(key);
  };

  // UI Helpers for features
  const getFeatureDisplay = (key: string, rawValue: any) => {
    const isBool = isBooleanFeature(key);
    const isTruthy = rawValue === "true" || rawValue === true;
    const isFalsy =
      rawValue === "false" ||
      rawValue === false ||
      rawValue === "0" ||
      rawValue === 0;

    let displayValue = "";
    if (!isBool) {
      if (key === "STORAGE_LIMIT") {
        displayValue = `${(Number(rawValue) / BYTES_IN_GB).toFixed(0)} GB`;
      } else {
        displayValue = String(rawValue);
      }
    }

    return {
      name: formatFeatureKey(key),
      hasFeature: !isFalsy,
      isBool,
      displayValue,
    };
  };

  return (
    <div className="p-4 space-y-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Plans</h1>
          <p className="text-muted-foreground mt-1">
            Configure your subscription tiers and feature limits.
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="lg">
          Create Plan
        </Button>
      </div>

      {/* CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="flex items-center justify-center col-span-full h-64">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
              <p className="mt-2 text-muted-foreground">Loading Tiers...</p>
            </div>
          </div>
        ) : (
          tiers.map((tier) => (
            <Card
              key={tier.tier_id}
              className="flex flex-col relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{tier.name}</h2>
                    <span className="text-sm text-muted-foreground capitalize">
                      {tier.billing_cycle} billing
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        tier.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {tier.is_active ? "Active" : "Inactive"}
                    </span>
                    {tier.is_trial && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                        Trial
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        !tier.features_visible_to_client &&
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {!tier.features_visible_to_client && "Features Hidden"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline text-4xl font-extrabold">
                  ₹{tier.price}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">
                    /{tier.billing_cycle === "monthly" ? "mo" : "yr"}
                  </span>
                </div>
              </CardHeader>

              <div className="h-px bg-border w-full" />

              <CardContent className="flex-1 p-6">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Included Features
                </h4>
                <ul className="space-y-3">
                  {tier.Features?.map((feature: any, i: number) => {
                    const { name, hasFeature, isBool, displayValue } =
                      getFeatureDisplay(
                        feature.key,
                        feature.TierFeature?.value ?? feature.value,
                      );

                    return (
                      <li
                        key={i}
                        className={`flex items-start gap-3 text-sm ${!hasFeature ? "text-muted-foreground/60" : "text-foreground"}`}
                      >
                        {hasFeature ? (
                          <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                        ) : (
                          <X className="w-4 h-4 mt-0.5 text-muted-foreground/50 shrink-0" />
                        )}
                        <span className="flex-1">
                          {name}{" "}
                          {!isBool && hasFeature && (
                            <span className="font-semibold">
                              : {displayValue}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>

              <div className="h-px bg-border w-full" />

              <CardFooter className="p-4 bg-muted/20 flex gap-3">
                <Button
                  onClick={() => handleEdit(tier)}
                  className="flex-1"
                  variant="default"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Plan
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                  onClick={() => {
                    setSelectedTierId(tier.tier_id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* DIALOGS REMAIN UNCHANGED BELOW */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Update Plan" : "Create Plan"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={form.name}
              required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Input
              type="number"
              placeholder="Price"
              value={form.price}
              required
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
            />

            <div>
              <Label>Billing Cycle</Label>
              <select
                className="w-full p-2 mt-1 border rounded"
                value={form.billing_cycle}
                onChange={(e) =>
                  setForm({ ...form, billing_cycle: e.target.value })
                }
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <span>Is Trial Plan</span>
              <Switch
                checked={form.is_trial === true}
                onCheckedChange={(val) =>
                  setForm({
                    ...form,
                    is_trial: val,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <span>Features Visible To Client</span>

              <Switch
                checked={form.features_visible_to_client === true}
                onCheckedChange={(val) =>
                  setForm({
                    ...form,
                    features_visible_to_client: val,
                  })
                }
              />
            </div>

            {/* DYNAMIC FEATURES */}
            <div>
              <Label>Features</Label>

              {featuresList.map((feature) => {
                const key = feature.key;
                const value = form.features?.[key];

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2 mt-2 border rounded"
                  >
                    <span>{formatFeatureKey(key)}</span>

                    {isBooleanFeature(key) ? (
                      <Switch
                        checked={value === true || value === "true"}
                        onCheckedChange={(val) =>
                          setForm({
                            ...form,
                            features: {
                              ...form.features,
                              [key]: val,
                            },
                          })
                        }
                      />
                    ) : (
                      <>
                        {key === "STORAGE_LIMIT" ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              className="w-24"
                              value={value || ""}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  features: {
                                    ...form.features,
                                    [key]: e.target.value,
                                  },
                                })
                              }
                            />
                            <span className="text-sm text-gray-500">GB</span>
                          </div>
                        ) : (
                          <Input
                            type="number"
                            className="w-24"
                            value={value || ""}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                features: {
                                  ...form.features,
                                  [key]: e.target.value,
                                },
                              })
                            }
                          />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <Button onClick={handleSubmit} className="w-full">
              {editMode ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle>Deactivate Plan</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to deactivate this plan?
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
              >
                Yes, Deactivate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminPlans;
