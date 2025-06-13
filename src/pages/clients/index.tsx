import api from "@/api";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { Device, DevicesResponse, columns } from "./columns";
import { data } from "react-router-dom";
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
  name: string,
  email: string,
  phoneNumber: number
}
function Clients() {
  const [data, setData] = useState<Device[]>([])
  const [client, setClient] = useState<Client>({})
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchDta = async () => {
    const response =  await api.get<DevicesResponse>('/ads/clients')
    setData(response.clients)
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
      await api.post('/ads/create-client', client);
      fetchDta();
      setLoading(false);
      setOpen(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };
  
  return (
    <div className="">
      <div className="flex items-center w-full mb-4">
      <div className="">
      <p className="text-md font-semibold ">
        Clients
        </p>
        <p className="text-sm text-muted-foreground">
          list of all Clients 
        </p>
      </div>

      <div className="ml-auto">
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
      <Button >
          Create Client
          <Plus className="h-4 w-4"/>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Client</DialogTitle>
        </DialogHeader>

    
   
        <Label>Name</Label>
        <Input
          type="text"
          value={client?.name}
          onChange={(e) => setClient({ ...client, name: e.target.value })}
        />
        <Label>Email</Label>
        <Input
          type="email"
          value={client?.email}
          onChange={(e) => setClient({ ...client, email: e.target.value })}
        />
        <Label>Phone</Label>
        <Input
          type="number"
          value={client?.phoneNumber}
          onChange={(e) => setClient({ ...client, phoneNumber: parseInt(e.target.value) })}
        />
        {/* <Label>Duration</Label>
        <Input
          type="number"
          value={ad?.duration}
          onChange={(e) => setAd({ ...ad,duration: parseInt(e.target.value)})}
          readOnly
          defaultValue={10}
        /> */}
        {/* {error && <span className="text-red-500 text-sm">{error}</span>} */}

        <DialogFooter>
          <Button onClick={handleCreate} disabled={loading}>
            <Save />
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
 
      </div>
      </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {data.map((client)=>{
       
        return(
          
          <div>

          <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{client.name}</CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.adsCount}</div>
            <p className="text-xs text-muted-foreground">Total Ads </p>
          </CardContent>
        </Card>
        </div>


        )
      })}
      </div>
      {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3"> */}

    </div>
  );
}

export default Clients;
