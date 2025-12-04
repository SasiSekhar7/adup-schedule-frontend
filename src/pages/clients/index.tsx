import api from "@/api";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BadgeDollarSign, Plus, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Client {
  name: string;
  email: string;
  phoneNumber: number;
  adsCount: number;
}

interface ClientsResponse {
  clients: Client[];
}

interface ClientInput {
  name: string;
  email: string;
  phoneNumber: number;
}

function Clients() {
  const [data, setData] = useState<Client[]>([]);
  const [client, setClient] = useState<ClientInput>({
    name: "",
    email: "",
    phoneNumber: 0,
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchDta = async () => {
    const response = await api.get<ClientsResponse>("/ads/clients");
    setData(response.data.clients);
  };

  useEffect(() => {
    fetchDta();
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    const { name, email, phoneNumber } = client;

    // Email validation (basic format check)
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    // Phone number validation (should be 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber.toString())) {
      alert("Please enter a valid 10-digit phone number.");
      setLoading(false);
      return;
    }

    if (!name || !email || !phoneNumber) {
      alert("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/ads/create-client", client);
      fetchDta();
      setLoading(false);
      setOpen(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4">
        <div className="">
          <p className="text-lg md:text-xl font-semibold">Clients</p>
          <p className="text-sm text-muted-foreground">List of all clients</p>
        </div>

        <div className="w-full sm:w-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <span className="hidden sm:inline">Create Client</span>
                <span className="sm:hidden">Create</span>
                <Plus className="h-4 w-4 ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent   className="
  max-w-[350px]
  md:max-w-[calc(100vw-20rem)]
  relative
">
              <DialogHeader>
                <DialogTitle className="text-base md:text-lg">
                  Create Client
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={client?.name}
                    onChange={(e) =>
                      setClient({ ...client, name: e.target.value })
                    }
                    placeholder="Enter client name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={client?.email}
                    onChange={(e) =>
                      setClient({ ...client, email: e.target.value })
                    }
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    type="number"
                    value={client?.phoneNumber}
                    onChange={(e) =>
                      setClient({
                        ...client,
                        phoneNumber: parseInt(e.target.value),
                      })
                    }
                    placeholder="Enter 10-digit phone number"
                  />
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  <Save className="mr-2" />
                  {loading ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((client, index) => (
          <Card key={index} className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {client.name}
              </CardTitle>
              <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{client.adsCount}</div>
              <p className="text-xs text-muted-foreground">Total Ads</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Clients;
