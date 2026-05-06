import { useEffect, useState } from "react";
import api from "@/api";
import { DataTable } from "@/components/data-table";
import { userColumns, User } from "./columns";
import AddUsers from "./components/add";
import { Card, CardContent } from "@/components/ui/card";

function Users() {
  const [data, setData] = useState<User[]>([]);

  const fetchData = async () => {
    const response = await api.get("/user/all");
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

      <Card className="w-full overflow-hidden">
        <CardContent className="p-0 ">
          <div className="w-full overflow-x-auto">
            {/* Mobile scroll hint */}
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
      </Card>
    </div>
  );
}

export default Users;
