import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Trash2, KeyRound, Shield, ShieldCheck, Eye, EyeOff } from "lucide-react";

function parseApiError(err: any): string {
  try {
    const raw = err?.message || "";
    const jsonStart = raw.indexOf("{");
    if (jsonStart !== -1) {
      const parsed = JSON.parse(raw.slice(jsonStart));
      return parsed.message || raw;
    }
    return raw || "Σφάλμα";
  } catch { return "Σφάλμα"; }
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [changePassId, setChangePassId] = useState<number | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "admin" });
  const [newPass, setNewPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => apiRequest("POST", "/api/admin/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowCreate(false);
      setForm({ name: "", email: "", password: "", role: "admin" });
      toast({ title: "Ο διαχειριστής δημιουργήθηκε" });
    },
    onError: (err: any) => toast({ title: parseApiError(err), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Ο διαχειριστής διαγράφηκε" });
    },
    onError: (err: any) => toast({ title: parseApiError(err), variant: "destructive" }),
  });

  const changePassMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      apiRequest("PATCH", `/api/admin/users/${id}/password`, { password }),
    onSuccess: () => {
      setChangePassId(null);
      setNewPass("");
      toast({ title: "Ο κωδικός ενημερώθηκε" });
    },
    onError: (err: any) => toast({ title: parseApiError(err), variant: "destructive" }),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Διαχειριστές</h1>
            <p className="text-muted-foreground text-sm mt-1">Διαχείριση λογαριασμών πρόσβασης στο admin panel</p>
          </div>
          <Button onClick={() => setShowCreate(true)} data-testid="btn-create-admin">
            <UserPlus className="w-4 h-4 mr-2" />
            Νέος Διαχειριστής
          </Button>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground text-sm">Φόρτωση...</div>
        ) : (
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Όνομα</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ρόλος</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ημ. Δημιουργίας</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/3 transition-colors" data-testid={`row-admin-${user.id}`}>
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={user.role === "superadmin" ? "default" : "secondary"}
                        className="gap-1"
                      >
                        {user.role === "superadmin" ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : user.role === "staff" ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <Shield className="w-3 h-3" />
                        )}
                        {user.role === "superadmin"
                          ? "Super Admin"
                          : user.role === "staff"
                            ? "Προσωπικό"
                            : "Admin"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("el-GR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => { setChangePassId(user.id); setNewPass(""); }}
                          data-testid={`btn-changepass-${user.id}`}
                        >
                          <KeyRound className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                          onClick={() => {
                            if (confirm(`Διαγραφή διαχειριστή "${user.name}";`)) {
                              deleteMutation.mutate(user.id);
                            }
                          }}
                          data-testid={`btn-delete-admin-${user.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-center py-12 text-muted-foreground">Δεν υπάρχουν διαχειριστές</p>
            )}
          </div>
        )}
      </div>

      {/* Create Admin Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Νέος Διαχειριστής</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Ονοματεπώνυμο</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="π.χ. Γιώργης Παπαδόπουλος"
                data-testid="input-new-admin-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@hitechdoctor.com"
                data-testid="input-new-admin-email"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Κωδικός</Label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Τουλάχιστον 8 χαρακτήρες"
                  className="pr-10"
                  data-testid="input-new-admin-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Απόκρυψη κωδικού" : "Εμφάνιση κωδικού"}
                >
                  {showPass ? <EyeOff className="w-4 h-4" aria-hidden /> : <Eye className="w-4 h-4" aria-hidden />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Ρόλος</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger data-testid="select-admin-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                  <SelectItem value="staff">Προσωπικό (μόνο ανατεθέντα αιτήματα)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Ακύρωση</Button>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending}
              data-testid="btn-submit-new-admin"
            >
              {createMutation.isPending ? "Δημιουργία..." : "Δημιουργία"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePassId !== null} onOpenChange={() => setChangePassId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Αλλαγή Κωδικού</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Νέος Κωδικός</Label>
              <div className="relative">
                <Input
                  type={showNewPass ? "text" : "password"}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Τουλάχιστον 8 χαρακτήρες"
                  className="pr-10"
                  data-testid="input-new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowNewPass(!showNewPass)}
                  aria-label={showNewPass ? "Απόκρυψη νέου κωδικού" : "Εμφάνιση νέου κωδικού"}
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" aria-hidden /> : <Eye className="w-4 h-4" aria-hidden />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setChangePassId(null)}>Ακύρωση</Button>
            <Button
              onClick={() => changePassId && changePassMutation.mutate({ id: changePassId, password: newPass })}
              disabled={changePassMutation.isPending || newPass.length < 8}
              data-testid="btn-submit-new-password"
            >
              {changePassMutation.isPending ? "Αποθήκευση..." : "Αποθήκευση"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
