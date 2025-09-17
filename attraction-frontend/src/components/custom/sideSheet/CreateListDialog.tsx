import { useState } from "react";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { FolderPlus, Plus } from "lucide-react";
import type { List } from "../../../@types/savedList";






const CreateListDialog = ({ onCreateList }: { onCreateList: (list: List) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');

  const handleCreate = () => {
    if (listName.trim()) {
      onCreateList({
        id: Date.now().toString(),
        name: listName.trim(),
        description: listDescription.trim(),
        places: [],
        icon: FolderPlus,
        color: 'text-blue-500',
        isCustom: true
      });
      setListName('');
      setListDescription('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Plus className="w-4 h-4 mr-2" />
          Create new list
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New List</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="listName">List Name</Label>
            <Input
              id="listName"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Enter list name..."
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="listDescription">Description (Optional)</Label>
            <Textarea
              id="listDescription"
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
              placeholder="Enter description..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!listName.trim()}>
            Create List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default CreateListDialog;