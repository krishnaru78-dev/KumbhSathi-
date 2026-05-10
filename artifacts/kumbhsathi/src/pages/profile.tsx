import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useUpdateUser, useUpdateEmergencyContacts, useGetUserBookmarks } from "@workspace/api-client-react";
import { getGetUserQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { User, Phone, Plus, Trash2, Loader2, LogOut, Globe, Heart } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export default function Profile() {
  const { user, setToken } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [language, setLanguage] = useState(user?.language || "hi");
  const [contacts, setContacts] = useState<EmergencyContact[]>((user?.emergencyContacts as EmergencyContact[]) || []);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relation: "" });
  const [showAddContact, setShowAddContact] = useState(false);
  const [tab, setTab] = useState<"profile" | "contacts" | "medical">("profile");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
      setLanguage(user.language || "hi");
      setContacts((user.emergencyContacts as EmergencyContact[]) || []);
    }
  }, [user]);

  const { data: bookmarks } = useGetUserBookmarks(user?.id || "", {
    query: { enabled: !!user?.id, queryKey: ["bookmarks", user?.id] },
  });

  const updateMutation = useUpdateUser({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetUserQueryKey(user?.id || "") });
        toast({ title: "Profile updated" });
      },
    },
  });

  const contactsMutation = useUpdateEmergencyContacts({
    mutation: {
      onSuccess: () => {
        toast({ title: "Emergency contacts updated" });
      },
    },
  });

  const handleSave = () => {
    if (!user) return;
    updateMutation.mutate({ userId: user.id, data: { name, phone: phone || undefined, language } });
  };

  const addContact = () => {
    if (!newContact.name || !newContact.phone) return;
    const updated = [...contacts, { ...newContact, id: Date.now().toString() }];
    setContacts(updated);
    contactsMutation.mutate({ userId: user?.id || "", data: { contacts: updated } });
    setNewContact({ name: "", phone: "", relation: "" });
    setShowAddContact(false);
  };

  const removeContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    contactsMutation.mutate({ userId: user?.id || "", data: { contacts: updated } });
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center gap-4">
        <User className="w-16 h-16 text-muted-foreground" />
        <p className="font-semibold text-lg">Not signed in</p>
        <p className="text-sm text-muted-foreground">Sign in to save your profile and emergency contacts</p>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  const tabs = ["profile", "contacts", "medical"];

  return (
    <div className="space-y-4 p-4 pb-6">
      {/* Avatar */}
      <div className="flex items-center gap-4 py-2">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">{user.name[0]?.toUpperCase()}</span>
        </div>
        <div>
          <p className="font-bold text-lg">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email || "Guest"}</p>
          {user.isGuest && <Badge className="text-xs bg-muted text-muted-foreground border mt-1">Guest</Badge>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t as any)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Personal Info</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone</Label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Language</Label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="en">English</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={() => { setToken(null); setLocation("/login"); }}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      )}

      {tab === "contacts" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Emergency Contacts</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setShowAddContact(true)} className="gap-1 text-primary">
                  <Plus className="w-4 h-4" />Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {contacts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No emergency contacts added</p>
              )}
              {contacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.relation} • {c.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={`tel:${c.phone}`}>
                      <Button size="icon" variant="ghost" className="w-8 h-8"><Phone className="w-4 h-4 text-primary" /></Button>
                    </a>
                    <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => removeContact(c.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {showAddContact && (
                <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
                  <Input placeholder="Name" value={newContact.name} onChange={(e) => setNewContact((c) => ({ ...c, name: e.target.value }))} />
                  <Input type="tel" placeholder="Phone" value={newContact.phone} onChange={(e) => setNewContact((c) => ({ ...c, phone: e.target.value }))} />
                  <Input placeholder="Relation (e.g. Son, Wife)" value={newContact.relation} onChange={(e) => setNewContact((c) => ({ ...c, relation: e.target.value }))} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addContact} className="flex-1">Add</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowAddContact(false)} className="flex-1">Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "medical" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <CardTitle className="text-sm">Medical Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <p className="text-xs text-muted-foreground">This information helps first responders in case of emergency</p>
            <div className="space-y-1.5">
              <Label className="text-xs">Blood Group</Label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select blood group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Allergies</Label>
              <Input placeholder="e.g. Penicillin, peanuts" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Medical Conditions</Label>
              <Input placeholder="e.g. Diabetes, hypertension" />
            </div>
            <Button className="w-full">Save Medical Info</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
