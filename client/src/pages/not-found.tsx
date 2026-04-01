import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-background">
      <Navbar />
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md mx-4 border-white/10 bg-card/80">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-foreground">404 — Η σελίδα δεν βρέθηκε</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Η σελίδα δεν βρέθηκε. Επιστρέψτε στην αρχική ή χρησιμοποιήστε το μενού.
          </p>
          <Button asChild className="mt-6 w-full" variant="default">
            <Link href="/">Αρχική</Link>
          </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
