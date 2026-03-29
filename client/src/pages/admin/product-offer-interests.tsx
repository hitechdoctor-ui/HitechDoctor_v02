import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, Loader2, Tag } from "lucide-react";
import type { ProductOfferInterest } from "@shared/schema";

const STORAGE_KEY = "hitech_admin_token";

function formatDt(d: Date | string | null | undefined) {
  if (d == null) return "—";
  return new Intl.DateTimeFormat("el-GR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

async function fetchRows(): Promise<ProductOfferInterest[]> {
  const token = localStorage.getItem(STORAGE_KEY);
  const res = await fetch("/api/admin/product-offer-interests", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Αδυναμία φόρτωσης");
  return res.json();
}

export default function AdminProductOfferInterests() {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["admin-product-offer-interests"],
    queryFn: fetchRows,
  });

  return (
    <AdminLayout>
      <Seo title="Καλύτερη προσφορά — Admin" description="Εκδηλώσεις ενδιαφέροντος eShop" />
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Tag className="w-6 h-6 text-primary" />
            Καλύτερη προσφορά (eShop)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Αιτήματα από το κουμπί «Θέλω καλύτερη προσφορά!» στη σελίδα προϊόντος.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Φόρτωση…
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400">{(error as Error).message}</p>
        )}

        {!isLoading && !error && (
          <Card className="bg-card border-white/8">
            <CardHeader>
              <CardTitle className="text-lg">Εγγραφές</CardTitle>
              <CardDescription>Ταξινόμηση: νεότερα πρώτα.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {data.length === 0 ? (
                <p className="text-sm text-muted-foreground">Δεν υπάρχουν αιτήματα ακόμα.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ημερομηνία</TableHead>
                      <TableHead>Προϊόν</TableHead>
                      <TableHead>Όνομα</TableHead>
                      <TableHead>Κινητό</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                          {formatDt(row.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground max-w-[220px]">{row.productName}</div>
                          {row.productSlug ? (
                            <Link
                              href={`/eshop/${row.productSlug}`}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Άνοιγμα σελίδας
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">ID: {row.productId}</span>
                          )}
                        </TableCell>
                        <TableCell>{row.customerName}</TableCell>
                        <TableCell>
                          <a href={`tel:${row.phone.replace(/\s/g, "")}`} className="text-primary font-medium hover:underline">
                            {row.phone}
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
