import { useEffect, useState } from "react";
import api from "@/api";
import { DataTable } from "@/components/data-table";
import { userColumns, User } from "./columns";
import AddUsers from "./components/add";
import { Card, CardContent } from "@/components/ui/card";

function Users() {
  const [data, setData] = useState<User[]>([]);

  const fetchData = async () => {
    const response: any = await api.get("/user/all");
    setData(response.users);
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
    user.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="sw-full min-w-0 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-2xl font-semibold">Users</p>
          <p className="text-sm text-muted-foreground">List of all users</p>
        </div>
        <div className="w-full sm:w-auto">
          {/* Pass onIsOpenChange to AddUsers so it can trigger a data refresh */}
          <AddUsers onIsOpenChange={onIsOpenChange} />
        </div>
      </div>

      {/* <Card className="w-full overflow-hidden">
        <CardContent className="p-0 ">
          <div className="w-full overflow-x-auto">
            
            <div className="md:hidden absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground border">
              Scroll →
            </div>
            <div className="min-w-[950px]">
              <DataTable
                data={data}
                columns={userColumns}
                filters={[{ label: "Name", value: "name" }]}
                maxHeight="none"
              />
            </div>
          </div>
        </CardContent>
      </Card> */}

      <Card className="w-full overflow-hidden">
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <DataTable
              data={data}
              columns={userColumns}
              filters={[{ label: "Name", value: "name" }]}
              maxHeight="none"
            />
          </div>

          {/* Mobile View */}
          <div className="md:hidden p-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full mb-4 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/* Cards */}
            <div className="space-y-3">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className="rounded-lg border p-4 bg-background"
                  >
                    <div className="font-semibold">{user.name}</div>

                    <div className="text-sm text-muted-foreground mt-1 break-all">
                      {user.email}
                    </div>

                    <div className="mt-2 text-sm">
                      <span className="font-medium">Role:</span> {user.role}
                    </div>

                    <div className="mt-1 text-sm">
                      <span className="font-medium">Status:</span> {user.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground py-6">
                  No users found
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Users;
