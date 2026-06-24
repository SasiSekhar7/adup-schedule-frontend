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
import { Group } from "../columns";
import api from "@/api";
import { CirclePlus, Edit, SquarePen, Trash } from "lucide-react";
const MessageCell = ({
  group,
  mobileView = false,
}: {
  group: Group;
  mobileView?: boolean;
}) => {
  const { message, group_id } = group;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState(message);

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log("Save message for group", group_id, inputMessage);
      // For example, you might update your data state or refetch the table
      await api.post("/scroll-text", { group_id, message: inputMessage });
      location.reload();
      setOpen(false);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.post(`/scroll-text/delete/${group_id}`);
      location.reload();

      setOpen(false);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {mobileView ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {message ? "Edit Message" : "Add Message"}
            </Button>
          ) : message ? (
            <div className="max-w-[20vw] flex items-center space-x-2">
              <span className="truncate overflow-hidden whitespace-nowrap text-ellipsis pr-4">
                {message}
              </span>

              <Button
                variant="ghost"
                size="sm"
                title="Edit Message"
                onClick={(e) => e.stopPropagation()}
              >
                <SquarePen className="h-4 w-4 text-blue-500" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" onClick={(e) => e.stopPropagation()}>
              <CirclePlus size="sm" />
            </Button>
          )}
        </DialogTrigger>

        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Add Scrolling Message</DialogTitle>
          </DialogHeader>
          <Textarea
            value={inputMessage || ""}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Enter message here..."
          />
          <DialogFooter className="gap-2">
            {message && (
              <Button onClick={handleDelete} disabled={loading}>
                Delete
              </Button>
            )}

            <Button onClick={handleSave} disabled={loading}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessageCell;
