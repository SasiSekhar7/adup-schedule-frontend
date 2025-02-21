import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Schedule } from "../columns";
import api from "@/api";
import { Trash, Trash2Icon } from "lucide-react";
const MessageCell = ({ schedule_id }: { schedule_id: Schedule }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log("Save message for group", group_id, inputMessage);
      // For example, you might update your data state or refetch the table
      await api.post("/scroll-text", { group_id, message: inputMessage });
      location.reload();
      setOpen(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.post(`/schedule/delete/${schedule_id}`);
      location.reload();

      setOpen(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          
            <Button variant="ghost">
              <Trash2Icon size="sm" />
            </Button>

        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to Delete the Schedule?</DialogTitle>
          </DialogHeader>
          
          <DialogFooter>
            <Button onClick={handleDelete} disabled={loading}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessageCell;
