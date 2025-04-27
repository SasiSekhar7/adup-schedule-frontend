import { useEffect, useState } from "react";
import api from "@/api";
import { DataTable } from "@/components/data-table";
import { userColumns, User } from "./columns";
import AddUsers from "./components/add";

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
    <div>
      <div className="flex items-center w-full mb-4">
        <div>
          <p className="text-md font-semibold">Users</p>
          <p className="text-sm text-muted-foreground">List of all users</p>
        </div>
        <div className="ml-auto">
          {/* Pass onIsOpenChange to AddUsers so it can trigger a data refresh */}
          <AddUsers onIsOpenChange={onIsOpenChange} />
        </div>
      </div>
      
      {/* Show loading indicator if data is being fetched */}
      
        <DataTable data={data} columns={userColumns} filters={[{ label: "Name", value: "name" }]} />
      
    </div>
  );
}

export default Users;
