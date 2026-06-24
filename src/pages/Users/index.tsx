import { useEffect, useState } from "react";
import api from "@/api";
import { DataTable } from "@/components/data-table";
import { userColumns, User } from "./columns";
import AddUsers from "./components/add";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "lucide-react";
import MobileUserCard from "./components/mobile-user-card";

function Users() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response: any = await api.get("/user/all");
      setData(response.users);
    } catch (error: any) {
      setLoading(false);
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch when the component is mounted
  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data when a user is added
  const onIsOpenChange = () => {
    fetchData();
  };

  const [search, setSearch] = useState("");
  const filteredUsers = data.filter((user) =>
    [user.name, user.email, user.client_name]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    // ✅ 1. Added h-full and flex/flex-col to strictly manage height
    <div className="flex flex-col w-full h-full min-w-0 space-y-4 md:space-y-6">
      {/* Header Section - shrink-0 ensures this title bar doesn't get crushed */}
      <div className="flex flex-col flex-shrink-0 gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-2xl font-semibold">Users</p>
          <p className="text-sm text-muted-foreground">List of all users</p>
        </div>
        <div className="w-full sm:w-auto">
          {/* Pass onIsOpenChange to AddUsers so it can trigger a data refresh */}
          <AddUsers onIsOpenChange={onIsOpenChange} />
        </div>
      </div>

      {loading ? (
        // Loading state - flex-1 centers it in the remaining space
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
            <p className="mt-2 text-muted-foreground">Loading Users...</p>
          </div>
        </div>
      ) : (
        // ✅ 2. Card becomes flex-1 to fill the EXACT remaining space below the header
        <Card className="flex flex-col flex-1 w-full min-h-0 overflow-hidden">
          {/* ✅ 3. CardContent also needs to stretch fully */}
          <CardContent className="flex flex-col flex-1 min-h-0 p-0">
            {/* Desktop Table Wrapper */}
            {/* ✅ 4. Changed from hidden md:block to hidden md:flex flex-col flex-1 min-h-0 */}
            <div className="flex-col flex-1 hidden min-h-0 md:flex">
              <DataTable
                data={data}
                columns={userColumns}
                filters={[{ label: "Name", value: "name" }]}
                maxHeight="none"
              />
            </div>

            {/* Mobile View Wrapper */}
            <div className="flex flex-col flex-1 p-4 overflow-y-auto md:hidden">
              {/* Search */}
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 mb-4 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <div className="space-y-4">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user: User) => (
                    <MobileUserCard
                      key={user.user_id}
                      user={user}
                      onRefresh={fetchData}
                    />
                  ))
                ) : (
                  <div className="py-6 text-sm text-center text-muted-foreground">
                    No users found
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Users;
