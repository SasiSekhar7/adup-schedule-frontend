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

interface AdToSubmit {
  client_id: string;
  name: string;
  duration: number;
}
function AddAdComponent({ onIsOpenChange }) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState();
  const [file, setFile] = useState<File>();
  const [ad, setAd] = useState<AdToSubmit>({duration:10});
  const [error, setError] = useState<string>();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get("/ads/clients");
        setClients(data.clients);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async () => {
    try {
      if (!file) throw "No File uploaded";
      const { name, duration, client_id } = ad;
      console.log(ad);
      if (!name || !duration || !client_id) throw "Missing Parameters";

      const formData = new FormData();

      formData.append('file', file);
      formData.append('client_id', ad?.client_id);
      formData.append('name', ad?.name);
      formData.append('duration', ad?.duration);
      await api.post('/ads/add', formData)
    } catch (error) {
      setError(error);
      console.log(error);
    }
  };
  return (
    <Dialog>
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
          <div>
            <Label>Client</Label>

            <Select
              required
              onValueChange={(client_id) => setAd({ ...ad,client_id: client_id })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {clients?.map((client) => (
                    <SelectItem value={client.client_id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto">
            <Label>File</Label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
          </div>
        </div>

        <Label>Name</Label>
        <Input
          type="text"
          value={ad?.name}
          onChange={(e) => setAd({ ...ad,name: e.target.value })}
        />
        <Label>Duration</Label>
        <Input
          type="number"
          value={ad?.duration}
          onChange={(e) => setAd({ ...ad,duration: parseInt(e.target.value)})}
          readOnly
          defaultValue={10}
        />
        {error && <span className="text-red-500 text-sm">{error}</span>}

        <DialogFooter>
          <Button onClick={handleCreate}>
            <Save />
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddAdComponent;
