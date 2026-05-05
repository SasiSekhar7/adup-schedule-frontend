import api from "@/api";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

  //  FETCH TIERS
  const fetchTiers = async () => {
    const res = await api.get("/tiers_v2/all");
    setTiers(res.data); //  correct
  };

  //  FETCH FEATURES MASTER
  const fetchFeatures = async () => {
    const res = await api.get("/features/all");
    console.log("Features:", res.data);
    setFeaturesList(res.data);
  };

  //  OPEN CREATE
  const handleOpenCreate = () => {
    const defaultFeatures: any = {};

    featuresList.forEach((f) => {
      if (isBooleanFeature(f.key)) {
        defaultFeatures[f.key] = false; // default toggle OFF
      } else {
        defaultFeatures[f.key] = ""; // or 0 based on your need
      }
    });
    setEditMode(false);

    setForm({
      name: "",
      description: "",
      price: 0,
      billing_cycle: "monthly",
      is_trial: false,
      // features: {},
      features: defaultFeatures,
    });
    setOpen(true);
  };

  //  EDIT (MAP FEATURES)
  const handleEdit = (tier: any) => {
    const featureMap: any = {};

    tier.Features?.forEach((f: any) => {
      const val = f.TierFeature?.value ?? f.value;

      if (f.key === "STORAGE_LIMIT") {
        featureMap[f.key] = bytesToGB(val); // ✅ convert to GB for UI
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
      features: featureMap,
    });

    setEditMode(true);
    setOpen(true);
  };

  //  BUILD FEATURES PAYLOAD
  const buildFeaturesPayload = () => {
    return featuresList.map((feature) => {
      let value = form.features?.[feature.key];

      // fallback if user didn't touch it
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

    if (!form.price || Number(form.price) <= 0) {
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

      if (!value || Number(value) <= 0) {
        toast.error(`${formatFeatureKey(key)} must be greater than 0`);
        return false;
      }
    }

    return true;
  };

  //  CREATE / UPDATE
  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!validateFeatures()) return;
    try {
      const payload = {
        name: form.name,
        price: form.price,
        billing_cycle: form.billing_cycle,
        is_trial: form.is_trial,
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

  //  DELETE (SOFT)
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

  //  FORMAT UI
  const formatFeatureKey = (key: string) => {
    return key
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatFeatureValue = (value: any, key?: string) => {
    if (value === "true" || value === true) return "Yes";
    if (value === "false" || value === false) return "No";

    if (key === "STORAGE_LIMIT") {
      return `${(Number(value) / BYTES_IN_GB).toFixed(0)} GB`;
    }

    return value;
  };

  //  BOOLEAN FEATURE DETECTION
  const isBooleanFeature = (key: string) => {
    return [
      "LIVE_STREAMING",
      "PROOF_OF_PLAY",
      "LIVE_IN_LAYOUT",
      "MULTI_VIDEO_IN_LAYOUT",
    ].includes(key);
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Manage Plans</h1>
        <Button onClick={handleOpenCreate}>Create Plan</Button>
      </div>

      {/*  CARDS */}
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card key={tier.tier_id} className="rounded-2xl shadow-lg">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-xl font-semibold">{tier.name}</h2>
              {/* <p className="text-gray-600">{tier.description}</p> */}
              <p className="text-2xl font-bold">₹{tier.price}</p>

              {/* STATUS */}
              <div className="flex justify-between">
                <span>Status</span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    tier.is_active
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {tier.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Billing Cycle</span>
                <span
                  className={`text-xs px-2 py-1 rounded "bg-green-100 text-gray-600
                     
                  `}
                >
                  {tier.billing_cycle}
                </span>
              </div>

              {/* Trial Badge */}
              {tier.is_trial && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                  Trial
                </span>
              )}

              {/* FEATURES */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {tier.Features?.map((feature: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between border p-1 rounded"
                  >
                    <span>{formatFeatureKey(feature.key)}</span>
                    <span>
                      {formatFeatureValue(
                        feature.TierFeature?.value ?? feature.value,
                        feature.key,
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-3">
                <Button onClick={() => handleEdit(tier)} variant="outline">
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setSelectedTierId(tier.tier_id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  Deactivate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/*  DIALOG */}
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

            {/* <Input
              placeholder="Description"
              value={form.description}
              required
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            /> */}

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
                className="w-full border rounded p-2 mt-1"
                value={form.billing_cycle}
                onChange={(e) =>
                  setForm({ ...form, billing_cycle: e.target.value })
                }
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="flex items-center justify-between border p-3 rounded">
              <span>Is Trial Plan</span>
              <Switch
                checked={form.is_trial === true}
                onCheckedChange={(val) =>
                  setForm({
                    ...form,
                    is_trial: val, // ✅ true / false
                  })
                }
              />
            </div>

            {/* 🔥 DYNAMIC FEATURES */}
            <div>
              <Label>Features</Label>

              {featuresList.map((feature) => {
                const key = feature.key;
                const value = form.features?.[key];

                return (
                  <div
                    key={key}
                    className="flex justify-between items-center border p-2 rounded mt-2"
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
                                    [key]: e.target.value, // still in GB
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
