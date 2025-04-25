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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import api from "@/api";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getRole } from "@/helpers";

interface AdToSubmit {
  client_id: string;
  name: string;
  duration: number;
}

function AddAdComponent({ onIsOpenChange }) {
  const [clients, setClients] = useState<{ client_id: string; name: string }[]>();
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
    const fetchData = async () => {
      try {
        const data = await api.get("/ads/clients");
        setClients(data.clients);
      } catch (error) {
        console.log(error);
      }
    };

    // Only fetch clients if the user is an Admin
    if (userRole === "Admin") {
      fetchData();
    }
  }, [userRole]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      if (!file) throw "No File uploaded";
      const { name, duration, client_id } = ad;
      console.log(ad);
      if (!name || !duration || (!client_id && userRole !== "Admin"))
        throw "Missing Parameters";

      const formData = new FormData();

      formData.append("file", file);
      formData.append("client_id", ad?.client_id);
      formData.append("name", ad?.name);
      formData.append("duration", ad?.duration);
      await api.post("/ads/add", formData);
      setLoading(false);
      setOpen(false);
      onIsOpenChange();
    } catch (error) {
      setError(error as string);
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>
          Uplaod Ad
          <Plus className="h-4 w-4" />
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
                required
                onValueChange={(client_id) =>
                  setAd({ ...ad, client_id: client_id })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {clients?.map((client) => (
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
          value={ad?.name}
          onChange={(e) => setAd({ ...ad, name: e.target.value })}
        />
        <Label>Duration</Label>
        <Input
          type="number"
          value={ad?.duration}
          onChange={(e) => setAd({ ...ad, duration: parseInt(e.target.value) })}
          readOnly
          defaultValue={10}
        />
        {error && <span className="text-red-500 text-sm">{error}</span>}

        <DialogFooter>
          <Button onClick={handleCreate} disabled={loading}>
            <Save />
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddAdComponent;