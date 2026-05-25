import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function ShowcaseDisclaimer() {
  const [open, setOpen] = useState(true);

  const handleAgree = () => {
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-[420px] p-8 sm:rounded-3xl border-border bg-background shadow-2xl">
        <AlertDialogHeader className="flex flex-col items-center space-y-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <AlertTriangle className="h-8 w-8 stroke-[1.5]" />
          </div>
          <AlertDialogTitle className="text-center text-xl font-bold tracking-tight">
            Sitenova Showcase Website
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-[15px] leading-relaxed text-muted-foreground">
            This is a non-commercial showcase portfolio website built by <span className="font-semibold text-foreground">Sitenova</span>. 
            It is intended for demonstration and portfolio purposes only. No real orders will be processed, and no actual payment is required.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8 flex flex-col items-center gap-3 sm:flex-col sm:space-x-0">
          <AlertDialogAction 
            onClick={handleAgree} 
            className="w-full h-12 text-base font-semibold transition-all"
          >
            I Understand & Agree
          </AlertDialogAction>
          <p className="text-[11px] text-muted-foreground/70 text-center px-4">
            By clicking agree, you acknowledge this is a mock shopping environment.
          </p>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
