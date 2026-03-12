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

interface Tier {
  tier_id?: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  storage_limit_bytes: string;
  max_devices: number;
  max_ads: number;
  is_active: boolean;
}

function AdminPlans() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Tier>({
    name: "",
    description: "",
    price: 0,
    billing_cycle: "monthly",
    storage_limit_bytes: "0",
    max_devices: 1,
    max_ads: 1,
    is_active: true,
  });

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    const res = await api.get("/all-tiers");
    setTiers(res);
  };

  const handleOpenCreate = () => {
    setEditMode(false);
    setForm({
      name: "",
      description: "",
      price: 0,
      billing_cycle: "monthly",
      storage_limit_bytes: "0",
      max_devices: 1,
      max_ads: 1,
      is_active: true,
    });
    setOpen(true);
  };

  const handleEdit = (tier: Tier) => {
    setEditMode(true);
    setForm(tier);
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editMode && form.tier_id) {
        await api.put(`/tiers/${form.tier_id}`, form);
        toast.success("Plan updated successfully");
      } else {
        await api.post("/tiers", form);
        toast.success("Plan created successfully");
      }

      fetchTiers();
      setOpen(false);
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const toggleStatus = async (tier_id: string) => {
    try {
      await api.patch(`/tiers/${tier_id}/toggle`);
      toast.success("Plan status updated");
      fetchTiers();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleAssignBasic = async () => {
    const confirmAction = confirm(
      "Are you sure you want to assign Basic plan to all clients without a plan?",
    );

    if (!confirmAction) return;

    try {
      await api.post("/assign-basic-to-existing");
      toast.success("Basic plan assigned successfully");
    } catch (error) {
      toast.error("Failed to assign Basic plan");
    }
  };

  return (
    <div className="p-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold mb-3">Manage Plans</h1>
        <div className="flex gap-3">
          {/* <Button variant="secondary" onClick={handleAssignBasic}>
            Assign Basic to Old Clients
          </Button> */}

          <Button onClick={handleOpenCreate}>Create Plan</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card key={tier.tier_id} className="rounded-2xl shadow-lg">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-xl font-semibold">{tier.name}</h2>
              <p className="text-gray-600">{tier.description}</p>
              <p className="text-2xl font-bold">₹{tier.price}</p>

              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  {(Number(tier.storage_limit_bytes) / 1073741824).toFixed(0)}{" "}
                  GB
                </p>
                <p>{tier.max_devices} Devices</p>
                <p>{tier.max_ads} Ads</p>
                <p>Status: {tier.is_active ? "Active" : "Inactive"}</p>
              </div>

              <div className="flex items-center  gap-2 mt-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleEdit(tier)}
                >
                  Edit
                </Button>

                <div className="">
                  {/* <span className="text-sm font-medium">
                    {tier.is_active ? "Active" : "Inactive"}
                  </span> */}

                  <Switch
                    checked={tier.is_active}
                    onCheckedChange={() => toggleStatus(tier.tier_id!)}
                    className="data-[state=checked]:bg-green-500 scale-125"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Update Plan" : "Create Plan"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Price</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <Label>Storage (GB)</Label>
              <Input
                type="number"
                value={Number(form.storage_limit_bytes) / 1073741824}
                onChange={(e) =>
                  setForm({
                    ...form,
                    storage_limit_bytes: (
                      Number(e.target.value) * 1073741824
                    ).toString(),
                  })
                }
              />
            </div>

            <div>
              <Label>Max Devices</Label>
              <Input
                type="number"
                value={form.max_devices}
                onChange={(e) =>
                  setForm({ ...form, max_devices: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <Label>Max Ads</Label>
              <Input
                type="number"
                value={form.max_ads}
                onChange={(e) =>
                  setForm({ ...form, max_ads: Number(e.target.value) })
                }
              />
            </div>

            <Button className="w-full" onClick={handleSubmit}>
              {editMode ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminPlans;
