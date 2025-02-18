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
import { Edit, Trash } from "lucide-react";
const MessageCell = ({ group }: { group: Group }) => {
    const { message, group_id } = group;
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false)
    const [inputMessage, setInputMessage] = useState(message);
  
    const handleSave = async() => {
        setLoading(true)
       try {
        console.log("Save message for group", group_id, inputMessage);
        // For example, you might update your data state or refetch the table
        await api.post('/scroll-text', {group_id, message:inputMessage});
        location.reload()
        setOpen(false);
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.log(error)
        
      }

    };
  
    const handleDelete = async() => {
        setLoading(true)
        try {       

         await api.post(`/scroll-text/delete/${group_id}`)
        location.reload()

         setOpen(false);
         setLoading(false)
       } catch (error) {
         setLoading(false)
         console.log(error)
         
       }
    };
  
    return (
      <div className="flex items-center space-x-2">
    
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
            {message ? (
          <div>
            <span className="truncate max-w-[10vw]">{message}</span>
            <Button variant='ghost' size="sm" >
              <Edit className="text-sm"/>
            </Button>
          </div>):              <Button size="sm">Add Message</Button>
}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Scrolling Message</DialogTitle>
              </DialogHeader>
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Enter message here..."
              />
              <DialogFooter>
              {message &&<Button onClick={handleDelete} disabled={loading}>Delete</Button>}

                <Button onClick={handleSave} disabled={loading}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
    
      </div>
    );
  };

  export default MessageCell;