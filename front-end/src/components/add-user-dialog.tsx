import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"
import { UserStats } from "@/lib/api"
  
  export function AddDialog({addUserDialog, setAddUserDialog, setUserStats, setFormat}: {
    addUserDialog: boolean,
    setAddUserDialog: (value: boolean) => void,
    setUserStats: (data: UserStats) => void,
    setFormat: (format: string | undefined) => void,
    }) {
    return (
      <AlertDialog open={addUserDialog} onOpenChange={setAddUserDialog} >
        <AlertDialogContent className="alert-dialog-content">
          <AlertDialogHeader>
            <AlertDialogTitle>Would you like start tracking user elo?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Add</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  