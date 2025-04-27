

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import api from "@/api";
import { getRole } from "@/helpers";

interface AdToSubmit {
  client_id?: string;
  name?: string;
  duration: number;
}

function AddAdComponent({ onIsOpenChange }: { onIsOpenChange: () => void }) {
  const [clients, setClients] = useState<{ client_id: string; name: string }[]>([]);
  const [file, setFile] = useState<File>();
  const [ad, setAd] = useState<AdToSubmit>({ duration: 10 });
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = getRole();
    setUserRole(role);
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { clients } = await api.get("/ads/clients");
        setClients(clients);
      } catch (err) {
        console.error(err);
      }
    };

    if (userRole === "Admin") {
      fetchClients();
    }
  }, [userRole]);

  const handleCreate = async () => {
    setLoading(true);
    setError(undefined);

    try {
      if (!file) throw new Error("No File uploaded");
      const { name, duration, client_id } = ad;

      if (!name || !duration || (userRole === "Admin" && !client_id)) {
        throw new Error("Missing Parameters");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      formData.append("duration", duration.toString());
      if (client_id) formData.append("client_id", client_id);

      await api.post("/ads/add", formData);

      setOpen(false);
      onIsOpenChange();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!file) return;
  
    const updateDuration = async () => {
      if (file.type.startsWith("video/")) {
        const duration = await getDuration(file);
        setAd((prev) => ({ ...prev, duration: Math.round(duration) || 10 }));
      } else {
        // If not a video (image or anything else), keep the default
        setAd((prev) => ({ ...prev, duration: 10 }));
      }
    };
  
    updateDuration();
  }, [file]);
  

async function getDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url); // Important: clean up memory
      resolve(video.duration);
    };
  });
}


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Upload Ad
          <Plus className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Ad</DialogTitle>
        </DialogHeader>

        <div className="flex space-x-4">
          {userRole === "Admin" && (
            <div>
              <Label>Client</Label>
              <Select
                onValueChange={(client_id) => setAd((prev) => ({ ...prev, client_id }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {clients.map((client) => (
                      <SelectItem key={client.client_id} value={client.client_id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className={userRole === "Admin" ? "ml-auto" : ""}>
            <Label>File</Label>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0])}
            />
          </div>
        </div>

        <Label>Name</Label>
        <Input
          type="text"
          value={ad.name || ""}
          onChange={(e) => setAd((prev) => ({ ...prev, name: e.target.value }))}
        />

        <Label>Duration</Label>
        <Input
          type="number"
          value={ad.duration}
          readOnly
        />

        {error && <span className="text-red-500 text-sm">{error}</span>}

        <DialogFooter>
          <Button onClick={handleCreate} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddAdComponent;
