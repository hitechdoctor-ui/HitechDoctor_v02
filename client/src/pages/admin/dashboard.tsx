import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useOrders } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { useCustomers } from "@/hooks/use-customers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, Euro } from "lucide-react";

export default function AdminDashboard() {
  const { data: orders } = useOrders();
  const { data: products } = useProducts();
  const { data: customers } = useCustomers();

  const totalRevenue = orders?.reduce((sum, order) => {
    if (order.status !== 'cancelled') {
      return sum + Number(order.totalAmount);
    }
    return sum;
  }, 0) || 0;

  const stats = [
    {
      title: "Συνολικά Έσοδα",
      value: new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(totalRevenue),
      icon: Euro,
      color: "text-green-500",
    },
    {
      title: "Παραγγελίες",
      value: orders?.length || 0,
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      title: "Προϊόντα",
      value: products?.length || 0,
      icon: Package,
      color: "text-purple-500",
    },
    {
      title: "Πελάτες",
      value: customers?.length || 0,
      icon: Users,
      color: "text-orange-500",
    },
  ];

  return (
    <AdminLayout>
      <Seo title="Dashboard" description="Admin Dashboard" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Επισκόπηση</h1>
        <p className="text-muted-foreground mt-1">Στατιστικά και δεδομένα καταστήματος</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card border-white/5 tech-glow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Quick links or latest orders could go here */}
      <div className="mt-12 glass-panel p-8 rounded-3xl border-dashed flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <LayoutDashboard className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">Καλώς ήρθατε στο Dashboard</h3>
        <p className="text-muted-foreground max-w-md">Χρησιμοποιήστε το μενού αριστερά για να διαχειριστείτε τα προϊόντα, τις παραγγελίες και το πελατολόγιό σας.</p>
      </div>
    </AdminLayout>
  );
}

// Needed because missing import
import { LayoutDashboard } from "lucide-react";
