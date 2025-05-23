import { useEffect, useState } from "react";
import EditAccount from "@/pages/Account/components/editacc"; // adjust the path if needed
import api from "@/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";


export default function AccountPage() {
  const [account, setAccount] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);

  const fetchAccount = async () => {
    try {
      const response = await api.get("/user/account");
      setAccount(response.account);
    } catch (error) {
      console.error("Failed to fetch account:", error);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  return (
    <div className="p-6">
      <Card className="p-6 max-w-xl mx-auto shadow-md space-y-4 relative">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Account Information</h1>
        </div>

      {account ? (
        <div className="space-y-2 mb-4">
          <p><strong>Name:</strong> {account.name}</p>
          <p><strong>Email:</strong> {account.email}</p>
          <p><strong>Phone Number:</strong> {account.phone_number}</p>
          <div>
            <strong>Role:</strong>{" "}
            <Badge variant="outline" className="capitalize">{account.role}</Badge>
          </div>
          <div><strong>Joined:</strong> {new Date(account.joined_on).toLocaleDateString()}</div>
        </div>
      ) : (
        <p>Loading account info...</p>
      )}

      <EditAccount
        onIsOpenChange={(open) => {
          setEditOpen(open);
          if (!open) fetchAccount(); // Refresh data on close
        }}
      />
      </Card>
    </div>
  );
}
