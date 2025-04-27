import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/api";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function AddUsers({ onIsOpenChange }) {
  const [user, setUser] = useState({
    name: "",
    client_id: "",
    email: "",
    phone_number: "",
    role: "",
    password: "",
  });
  const [clients, setClients] = useState<{ client_id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [existingEmails, setExistingEmails] = useState<string[]>([]);

  useEffect(() => {
    const fetchClientsAndUsers = async () => {
      try {
        const [clientsResponse, usersResponse] = await Promise.all([
          api.get("/ads/clients"),
          api.get("/user/all"),
        ]);
        setClients(clientsResponse.clients || []);
        
        console.log("Users response:", usersResponse);
        console.log("existingEmails:", existingEmails);
        console.log("Current email trying to add:", user.email);

  
        const usersList = usersResponse.users || usersResponse.data || [];
        const emails = usersList.map((user: any) => user.email) || [];
        setExistingEmails(emails);
      } catch (error) {
        console.error("Error fetching clients or users:", error);
      }
    };
    fetchClientsAndUsers();
  }, []);
  
  useEffect(() => {
    if (user.role === "Admin") {
      // Assuming you have a special admin client, you can fetch it from the clients list
      const adminClient = clients.find((client) => client.name === "ADUP");
      if (adminClient) {
        setUser((prev) => ({ ...prev, client_id: adminClient.client_id }));
      }
    } else {
      setUser((prev) => ({ ...prev, client_id: "" }));
    }
  }, [user.role, clients]);

  const handleCreate = async () => {
    try {
      setLoading(true);
      const { name, email, phone_number, password, role } = user;
  
      if (!name || !email || !phone_number || !password || !role) {
        throw "All fields are required.";
      }
  
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        throw "Please enter a valid email address.";
      }
  
      if (existingEmails.includes(email)) {
        throw "This email is already registered. Please use a different email.";
      }
  
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone_number)) {
        throw "Please enter a valid 10-digit phone number.";
      }
  
      if (role === "Client" && !user.client_id) {
        throw "Please select a client.";
      }
  
      const payload = {
        name,
        email,
        phone_number,
        password,
        role,
        ...(role === "Client" && { client_id: user.client_id }),
        ...(role === "Admin" && { client_id: user.client_id }),
      };
  
      console.log("Submitting user to backend:", payload);
  
      await api.post("/user/add", payload);
      setUser({
        name: "",
        client_id: "",
        email: "",
        phone_number: "",
        role: "",
        password: "",
      });
      setOpen(false);
      onIsOpenChange();
      setLoading(false);
    } catch (err: any) {
      console.error("Error submitting user:", err.response?.data || err.message);
      let message = "Something went wrong.";
      if (typeof err === "string") {
        message = err;
      } else if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message) {
        message = err.message;
      }
      setError(message);
      setLoading(false);
    }
  };
  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Add User
          <Plus className="h-4 w-4 ml-2" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            type="text"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
          />

          <Label>Email</Label>
          <Input
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />

          <Label>Phone</Label>
          <Input
            type="number"
            value={user.phone_number}
            onChange={(e) => setUser({ ...user, phone_number: e.target.value })}
            maxLength={10}
          />

          <Label>Password</Label>
          <Input
            type="password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
          />

          <Label>Role</Label>
          <Select
            onValueChange={(role) => setUser({ ...user, role })}
            value={user.role}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Client">Client</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {user.role && (
            <>
              <Label>Client</Label>
              <Select
                onValueChange={(client_id) => {
                  setUser({ ...user, client_id });
                }}
                value={user.client_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {user.role === "Admin" ? (
                      clients
                        .filter((client) => client.name === "ADUP")
                        .map((client) => (
                          <SelectItem key={client.client_id} value={client.client_id}>
                            {client.name}
                          </SelectItem>
                        ))
                    ) : (
                      clients
                        .filter((client) => client.client_id !== "ADUP")
                        .map((client) => (
                          <SelectItem key={client.client_id} value={client.client_id}>
                            {client.name}
                          </SelectItem>
                        ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <DialogFooter>
          <Button onClick={handleCreate} disabled={loading}>
            <Save className="mr-2" />
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddUsers;

