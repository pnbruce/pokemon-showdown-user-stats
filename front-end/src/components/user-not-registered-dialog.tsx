import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"
  
  export function NotRegisteredDialog({notRegisteredDialog, setNotRegisteredDialog, enteredUsername}: {
    notRegisteredDialog: boolean,
    setNotRegisteredDialog: (value: boolean) => void,
    enteredUsername: string,
    }) {
    return (
      <AlertDialog open={notRegisteredDialog} onOpenChange={setNotRegisteredDialog} >
        <AlertDialogContent className="alert-dialog-content">
          <AlertDialogHeader>
            <AlertDialogTitle>{enteredUsername} is not registered on Showdown</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Okay</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  