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
    <div className="space-y-4 md:space-y-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-lg md:text-xl font-semibold">Account</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account information
        </p>
      </div>

      <Card className="p-4 md:p-6 max-w-2xl mx-auto shadow-md space-y-4 relative">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-lg font-semibold">Account Information</h2>
        </div>

        {account ? (
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{account.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium break-all">{account.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium">{account.phone_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge variant="outline" className="capitalize">
                  {account.role}
                </Badge>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="font-medium">
                  {new Date(account.joined_on).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Loading account info...</p>
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
