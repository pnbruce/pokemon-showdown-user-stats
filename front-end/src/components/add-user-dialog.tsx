import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { UserStats, addUser } from "@/lib/api"
import { getFormat } from "@/lib/defaults";

export function AddDialog({ addUserDialog, setAddUserDialog, setUserStats, format, setFormat, enteredUsername }: {
    addUserDialog: boolean,
    setAddUserDialog: (value: boolean) => void,
    setUserStats: (data: UserStats) => void,
    format: string,
    setFormat: (format: string | undefined) => void,
    enteredUsername: string,
}) {

    const handleConfirm = async () => {
        const currentFormat = format;
        try {
            // Fetch user stats using the entered username
            const stats = await addUser(enteredUsername);
            // Update the state with the fetched stats
            setUserStats(stats);
            localStorage.setItem("username", JSON.stringify(stats.username));
            if (!(Object.keys(stats.formats).length === 0)) {
                const format = getFormat(stats.formats, currentFormat, "gen9randombattle");
                setFormat(format);
                localStorage.setItem("format", JSON.stringify(format));
            } else {
                setFormat(undefined);
            }
        } catch (error) {
            console.error("Failed to fetch user stats:", error);
            // Optionally, display an error message to the user
        }
    };

    return (
        <AlertDialog open={addUserDialog} onOpenChange={setAddUserDialog} >
            <AlertDialogContent className="alert-dialog-content">
                <AlertDialogHeader>
                    <AlertDialogTitle>Would you like start tracking elo for {enteredUsername}?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} >Yes</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
