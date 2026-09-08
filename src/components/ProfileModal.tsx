import { format } from "date-fns";
import { Phone, LogOut, ShieldCheck, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const ProfileModal = ({ open, onClose }: ProfileModalProps) => {
  const { user, signOut } = useAuth();
  if (!user) return null;

  const handleSignOut = () => {
    signOut();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[360px] rounded-2xl border-border/50 bg-card p-6">
        <DialogTitle className="sr-only">My Profile</DialogTitle>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 mb-5">
          <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center">
            <Phone className="w-7 h-7 text-accent" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-foreground tracking-tight">{user.maskedPhone}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">CardWiseOffer account</p>
          </div>
        </div>

        {/* Info rows */}
        <div className="rounded-xl border border-border/50 bg-secondary/20 divide-y divide-border/30 mb-5">
          <div className="flex items-center gap-3 px-4 py-3">
            <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Phone</p>
              <p className="text-[13px] font-semibold text-foreground">{user.maskedPhone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Signed in</p>
              <p className="text-[13px] font-semibold text-foreground">
                {format(user.signedInAt, "dd MMM yyyy, HH:mm")}
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleSignOut}
          className="w-full gap-2 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
