
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import type { List, Place } from "../../../@types/savedList";


const ListOptionsMenu = ({ list, onEdit, onDelete }: { list: List; onEdit: (list: List) => void; onDelete: (id: string) => void }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(list)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit List
        </DropdownMenuItem>
        {list.isCustom && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(list.id)} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete List
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ListOptionsMenu;