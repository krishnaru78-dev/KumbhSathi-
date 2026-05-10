import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateLostFoundReport } from "@workspace/api-client-react";
import { getListLostFoundReportsQueryKey, getGetLostFoundStatsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function LostFoundNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    type: "person",
    title: "",
    description: "",
    name: "",
    age: "",
    gender: "",
    lastSeenLocation: "",
    lastSeenTime: new Date().toISOString().slice(0, 16),
    contactName: "",
    contactPhone: "",
  });

  const createMutation = useCreateLostFoundReport({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListLostFoundReportsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetLostFoundStatsQueryKey() });
        toast({ title: "Report submitted", description: "Your report has been submitted successfully." });
        setLocation("/lost-found");
      },
      onError: () => {
        toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      data: {
        type: form.type,
        title: form.title,
        description: form.description,
        name: form.name || undefined,
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender || undefined,
        lastSeenLocation: form.lastSeenLocation,
        lastSeenTime: new Date(form.lastSeenTime).toISOString(),
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        photos: [],
      },
    });
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="p-4 pb-8 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/lost-found">
          <Button size="icon" variant="ghost" className="w-9 h-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-bold">Report Missing</h1>
          <p className="text-xs text-muted-foreground">Help find someone</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Report Type</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-2">
              {["person", "child", "item"].map((t) => (
                <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`py-2 rounded-lg text-sm font-medium border transition-all capitalize ${form.type === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>
                  {t}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Details</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Report Title *</Label>
              <Input placeholder={form.type === "item" ? "e.g. Red backpack lost near Sangam" : "e.g. Missing elderly man"} value={form.title} onChange={set("title")} required />
            </div>
            {form.type !== "item" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Name</Label>
                    <Input placeholder="Full name" value={form.name} onChange={set("name")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Age</Label>
                    <Input type="number" placeholder="Age" value={form.age} onChange={set("age")} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Gender</Label>
                  <select value={form.gender} onChange={set("gender")} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Description *</Label>
              <Textarea placeholder="Describe appearance, clothing, distinguishing features..." value={form.description} onChange={set("description")} required rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Last Seen</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Location *</Label>
              <Input placeholder="e.g. Near Gate 3, Sangam Ghat" value={form.lastSeenLocation} onChange={set("lastSeenLocation")} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date & Time *</Label>
              <Input type="datetime-local" value={form.lastSeenTime} onChange={set("lastSeenTime")} required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Contact Information</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Your Name *</Label>
              <Input placeholder="Your full name" value={form.contactName} onChange={set("contactName")} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone Number *</Label>
              <Input type="tel" placeholder="+91 98765 43210" value={form.contactPhone} onChange={set("contactPhone")} required />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={createMutation.isPending}>
          {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Submit Report
        </Button>
      </form>
    </div>
  );
}
