import { useMemo, useState } from "react";
import { useRoute, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RepairBottomProducts } from "@/components/repair-bottom-products";
import { PriceDisclaimer } from "@/components/price-disclaimer";
import { Seo } from "@/components/seo";
import { RepairRequestModal } from "@/components/repair-request-modal";
import { RepairPriceBreakdownCard } from "@/components/repair-price-breakdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { findModelBySlug, IPHONE_SERIES } from "@/data/iphone-devices";
import { mergeIphoneModel, useRepairPriceOverrideMap } from "@/lib/repair-price-overrides";
import {
  REPAIR_CTA_FULL,
  REPAIR_CTA_GRADIENT,
  REPAIR_CTA_WIDE,
  REPAIR_SIDEBAR_ESHOP,
  REPAIR_TAB_BTN,
} from "@/lib/repair-touch-ui";
import type { IPhoneModel } from "@/data/iphone-devices";
import {
  CheckCircle2, Monitor, Battery, Zap, ChevronRight, Phone,
  Shield, Star, Clock, Wrench, ShoppingCart, ArrowRight,
} from "lucide-react";
const repairScreenImg = "/images/repair-screen.webp";
const repairBatteryImg = "/images/repair-battery.webp";
const repairPortImg = "/images/repair-port.webp";

type TabId = "screen" | "battery" | "port";

const TAB_DEFS: { id: TabId; label: string; icon: typeof Monitor }[] = [
  { id: "screen",  label: "Αλλαγή Οθόνης",    icon: Monitor  },
  { id: "battery", label: "Αλλαγή Μπαταρίας",  icon: Battery  },
  { id: "port",    label: "Θύρα Φόρτισης",     icon: Zap      },
];

const TAB_IMAGES: Record<TabId, string> = {
  screen:  repairScreenImg,
  battery: repairBatteryImg,
  port:    repairPortImg,
};

const SIDEBAR_SUBCATEGORY: Record<TabId, string> = {
  screen:  "screen-protectors",
  battery: "cases",
  port:    "chargers",
};

const SIDEBAR_LABELS: Record<TabId, string> = {
  screen:  "Προτεινόμενα Τζάμια Προστασίας",
  battery: "Προτεινόμενες Θήκες",
  port:    "Προτεινόμενοι Φορτιστές",
};

function TierCard({ tier, selected, onClick }: {
  tier: { label: string; sublabel: string; price: number; features: string[]; badge?: string; recommended?: boolean };
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left rounded-2xl border p-5 transition-all touch-manipulation active:scale-[0.99] ${
        selected
          ? "border-primary bg-primary/8 shadow-[0_0_20px_rgba(0,210,200,0.15)]"
          : tier.recommended
          ? "border-primary/40 bg-primary/4 hover:border-primary/60"
          : "border-white/10 bg-card hover:border-white/20"
      }`}
      data-testid={`tier-${tier.label.toLowerCase()}`}
    >
      {tier.badge && (
        <span className="absolute -top-2.5 left-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-black">
          {tier.badge}
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display font-bold text-base text-foreground">{tier.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{tier.sublabel}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-extrabold text-primary">€{tier.price}</p>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      {selected && (
        <div className="mt-3 pt-3 border-t border-primary/20">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">✓ Επιλεγμένο</span>
        </div>
      )}
    </button>
  );
}

function Seo13() {
  return (
    <div className="prose prose-sm prose-invert max-w-none mt-8 text-muted-foreground leading-relaxed">
      <h2 className="text-xl font-display font-bold text-foreground mb-3">
        Αλλαγή Οθόνης iPhone 13 στην Αθήνα — Πλήρης Οδηγός
      </h2>
      <p>
        Η αλλαγή οθόνης iPhone 13 είναι μια από τις πιο συνηθισμένες επισκευές που πραγματοποιούμε καθημερινά στο HiTech Doctor. Το iPhone 13 διαθέτει OLED Super Retina XDR οθόνη 6.1 ιντσών, με αντοχή που υπερτερεί σε σχέση με παλιότερα μοντέλα, ωστόσο ένα τυχαίο πέσιμο ή χτύπημα αρκεί για να δημιουργήσει ρωγμές ή να προκαλέσει δυσλειτουργίες στην αφή και στα χρώματα.
      </p>
      <h3 className="text-lg font-display font-bold text-foreground mt-5 mb-2">
        Γιατί να επιλέξετε το HiTech Doctor για την Επισκευή σας
      </h3>
      <p>
        Στο HiTech Doctor, εξειδικευόμαστε αποκλειστικά στην επισκευή συσκευών Apple. Η ομάδα μας αποτελείται από πιστοποιημένους τεχνικούς με πάνω από 10 χρόνια εμπειρία στον χώρο, που έχουν διακρίνει χιλιάδες iPhone στα εργαστήριά μας. Κάθε επισκευή συνοδεύεται από γραπτή εγγύηση, διαφάνεια στις τιμές και ειλικρινή ενημέρωση για την κατάσταση της συσκευής σας.
      </p>
      <p>
        Χρησιμοποιούμε αποκλειστικά ανταλλακτικά υψηλής ποιότητας: είτε γνήσια Apple OEM, είτε premium aftermarket OLED που διατηρούν πλήρη λειτουργικότητα Face ID, TrueDepth κάμερας και υπερ-ευαίσθητης αφής. Η διαδικασία αντικατάστασης πραγματοποιείται σε καθαρό, εξοπλισμένο εργαστήριο με εξειδικευμένα εργαλεία — χωρίς εκπλήξεις στο τελικό κόστος.
      </p>
      <h3 className="text-lg font-display font-bold text-foreground mt-5 mb-2">
        Τι Περιλαμβάνει η Αλλαγή Οθόνης iPhone 13
      </h3>
      <p>
        Η διαδικασία αλλαγής οθόνης iPhone 13 στο εργαστήριό μας ακολουθεί αυστηρό πρωτόκολλο:
      </p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Δωρεάν τεχνικός έλεγχος & διάγνωση πριν την επισκευή</li>
        <li>Αφαίρεση της κατεστραμμένης οθόνης με εξειδικευμένα εργαλεία θέρμανσης</li>
        <li>Τοποθέτηση νέας OLED μονάδας με βαθμονόμηση αφής & Face ID</li>
        <li>Δοκιμή πολλαπλών λειτουργιών: αφή, φωτεινότητα, χρώματα, εγγύτητα & αισθητήρες</li>
        <li>Σφράγιση με νέο αδιάβροχο gasket για διατήρηση IP68 προστασίας</li>
        <li>Γραπτή εγγύηση για κάθε επισκευή</li>
      </ul>
      <h3 className="text-lg font-display font-bold text-foreground mt-5 mb-2">
        Πόσο Κοστίζει η Αλλαγή Οθόνης iPhone 13
      </h3>
      <p>
        Προσφέρουμε τρεις επιλογές ποιότητας ώστε να έχετε τον πλήρη έλεγχο του κόστους: Γνήσιο Apple OEM ανταλλακτικό για τη μέγιστη αυθεντικότητα, Premium aftermarket OLED για τον καλύτερο συνδυασμό αξίας/ποιότητας, και Standard αντικατάσταση για οικονομική επισκευή παλαιότερης συσκευής. Όλες οι επιλογές καλύπτουν πλήρη λειτουργικότητα Face ID και αισθητήρων.
      </p>
      <h3 className="text-lg font-display font-bold text-foreground mt-5 mb-2">
        Ταχύτητα, Εγγύηση & Αξιοπιστία
      </h3>
      <p>
        Το μεγάλο πλεονέκτημα του HiTech Doctor είναι η ταχύτητα εξυπηρέτησης. Στις περισσότερες περιπτώσεις, η αλλαγή οθόνης iPhone 13 ολοκληρώνεται εντός 30 έως 60 λεπτών, ώστε να αποχωρήσετε με το iPhone σας πλήρως λειτουργικό. Για κάθε επισκευή παρέχουμε γραπτή εγγύηση που καλύπτει τυχόν ελαττώματα του ανταλλακτικού ή της εργασίας.
      </p>
      <p>
        Βρισκόμαστε στην Αθήνα και δεχόμαστε συσκευές καθημερινά. Μπορείτε να περάσετε χωρίς ραντεβού ή να κλείσετε θέση online για εξυπηρέτηση χωρίς αναμονή. Η δωρεάν διάγνωση σημαίνει ότι δεν πληρώνετε τίποτα αν αποφασίσετε να μην προχωρήσετε στην επισκευή — καμία υποχρέωση, πλήρης διαφάνεια.
      </p>
      <p>
        Εμπιστευτείτε τη συσκευή σας στους ειδικούς. Το iPhone 13 σας αξίζει την καλύτερη φροντίδα — και εμείς είμαστε εδώ για να σας την παρέχουμε.
      </p>
    </div>
  );
}

function Seo15ProMax() {
  return (
    <div className="prose prose-sm prose-invert max-w-none mt-10 text-muted-foreground leading-relaxed">
      <h2 className="text-xl font-display font-bold text-foreground mb-3">
        Αλλαγή Οθόνης iPhone 15 Pro Max στο Μοσχάτο
      </h2>
      <p>
        Η αλλαγή οθόνης iPhone 15 Pro Max είναι η πιο συχνή επισκευή κινητού που πραγματοποιούμε καθημερινά στο εξειδικευμένο κέντρο service του HiTech Doctor, στο Μοσχάτο. Εξυπηρετούμε άμεσα Μοσχάτο, Ταύρο, Καλλιθέα και Πειραιά — και για όλη την υπόλοιπη Ελλάδα παραλαμβάνουμε και παραδίδουμε μέσω Box Now σε 24 ώρες.
      </p>
      <p>
        Είτε έχεις σπασμένη οθόνη iPhone 15 Pro Max μετά από πτώση, είτε χρειάζεσαι αντικατάσταση οθόνης λόγω νεκρών pixels, κακής αφής ή αποχρωματισμού — κάνουμε την επισκευή σε 30 λεπτά με γραπτή εγγύηση και δωρεάν τεχνική διάγνωση.
      </p>

      <h3 className="text-lg font-display font-bold text-foreground mt-6 mb-2">
        Επιλογές Ανταλλακτικού για Αντικατάσταση Οθόνης iPhone 15 Pro Max
      </h3>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Γνήσια — από €418 (100% αυθεντική εικόνα, Face ID/TrueDepth πλήρης λειτουργία, εγγύηση 24 μηνών)</li>
        <li>Refurbished Premium — από €330 (προτεινόμενο: ισοδύναμη καθημερινή εμπειρία, Face ID συμβατό, εγγύηση 12 μηνών)</li>
        <li>Standard — από €220 (οικονομική επιλογή με βασική εγγύηση)</li>
      </ul>
      <p>
        💡 Δεν ξέρεις τι είναι ακριβώς η Refurbished οθόνη; Διάβασε τον οδηγό μας:{" "}
        <a
          href="/blog/refurbished-othones-iphone-ti-einai"
          className="text-primary font-semibold hover:underline"
        >
          Refurbished Οθόνες iPhone: Τι Είναι & Αξίζουν;
        </a>
        ;
      </p>

      <h2 className="text-xl font-display font-bold text-foreground mt-8 mb-3">
        Αλλαγή Μπαταρίας iPhone 15 Pro Max στο Μοσχάτο
      </h2>
      <p>
        Εκτός από την επισκευή οθόνης, η αλλαγή μπαταρίας iPhone 15 Pro Max είναι η δεύτερη πιο συχνή επισκευή στο HiTech Doctor. Αν το iPhone σου δεν κρατάει μπαταρία, κλείνει ξαφνικά ή φορτίζει αργά — η αντικατάσταση μπαταρίας είναι η πιο γρήγορη και οικονομική λύση.
      </p>
      <p>
        Η μπαταρία iPhone 15 Pro Max έχει χωρητικότητα 4.422 mAh. Όταν η υγεία μπαταρίας (Battery Health) πέσει κάτω από 80%, η Apple συστήνει αντικατάσταση.
      </p>
      <h3 className="text-lg font-display font-bold text-foreground mt-6 mb-2">
        Πότε χρειάζεσαι αλλαγή μπαταρίας iPhone 15 Pro Max;
      </h3>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Το iPhone κλείνει μόνο του ακόμα και με 20–30% φόρτιση</li>
        <li>Η υγεία μπαταρίας είναι κάτω από 80%</li>
        <li>Αδειάζει μέσα σε λίγες ώρες</li>
        <li>Φορτίζει πολύ αργά ή δεν φορτίζει καθόλου</li>
        <li>Ζεσταίνεται υπερβολικά κατά τη φόρτιση</li>
        <li>Η μπαταρία έχει φουσκώσει (επείγον)</li>
      </ul>
      <p>
        Η αλλαγή μπαταρίας iPhone 15 Pro Max ολοκληρώνεται σε 30 λεπτά, με δωρεάν έλεγχο υγείας πριν και μετά.
      </p>

      <h2 className="text-xl font-display font-bold text-foreground mt-8 mb-3">
        Τι περιλαμβάνει κάθε επισκευή iPhone 15 Pro Max
      </h2>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Δωρεάν τεχνική διάγνωση πριν από κάθε εργασία</li>
        <li>Αλλαγή οθόνης ή μπαταρίας με ανταλλακτικά υψηλής ποιότητας</li>
        <li>Έλεγχος Face ID, αισθητήρων και πλήρους λειτουργίας μετά την επισκευή</li>
        <li>Γραπτή εγγύηση 6 έως 24 μήνες (ανάλογα με το ανταλλακτικό)</li>
        <li>Παράδοση σε 30 λεπτά (μπορείς να περιμένεις στο κατάστημα)</li>
        <li>Τελική τιμή με ανταλλακτικό + εργασία + εγγύηση (χωρίς κρυφές χρεώσεις)</li>
      </ul>

      <h2 className="text-xl font-display font-bold text-foreground mt-8 mb-3">
        Περιοχές που εξυπηρετούμε — Service iPhone κοντά σας
      </h2>
      <p>
        Το κατάστημά μας βρίσκεται στο Μοσχάτο (Στρατηγού Μακρυγιάννη 109, 18345) και εξυπηρετούμε άμεσα Μοσχάτο, Ταύρο, Καλλιθέα και Πειραιά.
      </p>
      <h3 className="text-lg font-display font-bold text-foreground mt-6 mb-2">
        Πανελλαδική αποστολή μέσω Box Now
      </h3>
      <p>
        Για όλη την υπόλοιπη Ελλάδα παραλαμβάνουμε και παραδίδουμε μέσω Box Now. Η επισκευή γίνεται την ίδια μέρα παραλαβής και επιστρέφεται σε 24 ώρες.
      </p>

      <h2 className="text-xl font-display font-bold text-foreground mt-8 mb-3">
        Γιατί να επιλέξεις το HiTech Doctor για service iPhone στο Μοσχάτο;
      </h2>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        <li>Εξειδίκευση σε επισκευή iPhone, Samsung, iPad, PlayStation</li>
        <li>Αποτέλεσμα σε 30 λεπτά — επί τόπου</li>
        <li>Γραπτή εγγύηση σε κάθε επισκευή</li>
        <li>Διαφανείς τιμές χωρίς εκπλήξεις</li>
        <li>Δωρεάν τεχνική διάγνωση — ακόμα κι αν δεν προχωρήσεις</li>
      </ul>
      <p>
        📺 Δες πώς κάνουμε επισκευές iPhone στο κανάλι μας:{" "}
        <a
          href="https://www.youtube.com/@HitechDoctor"
          target="_blank"
          rel="noopener"
          className="text-primary font-semibold hover:underline"
        >
          youtube.com/@HitechDoctor
        </a>
        {" "}— opens in new tab
      </p>

      <h2 className="text-xl font-display font-bold text-foreground mt-8 mb-3">
        Συχνές Ερωτήσεις — Επισκευή iPhone 15 Pro Max
      </h2>
      <h3 className="text-lg font-display font-bold text-foreground mt-5 mb-2">
        Πόσο κοστίζει η αλλαγή οθόνης iPhone 15 Pro Max;
      </h3>
      <p>
        Η αντικατάσταση οθόνης iPhone 15 Pro Max ξεκινά από €220 (Standard), €330 (Refurbished Premium — προτεινόμενο) και €418 (Γνήσια Apple OEM). Στην τιμή περιλαμβάνεται ανταλλακτικό, εργασία και εγγύηση.
      </p>
      <h3 className="text-lg font-display font-bold text-foreground mt-5 mb-2">
        Χάνεται το Face ID μετά από αλλαγή οθόνης;
      </h3>
      <p>
        Όχι. Με τα κατάλληλα ανταλλακτικά και σωστή εγκατάσταση, το Face ID διατηρείται πλήρως. Πάντα γίνεται έλεγχος Face ID μετά την επισκευή.
      </p>
      <h3 className="text-lg font-display font-bold text-foreground mt-5 mb-2">
        Πόσο χρόνο παίρνει η επισκευή;
      </h3>
      <p>
        Και η αλλαγή οθόνης και η αλλαγή μπαταρίας ολοκληρώνονται σε 30 λεπτά. Μπορείς να περιμένεις στο κατάστημά μας στο Μοσχάτο.
      </p>
    </div>
  );
}

function SeoLoremIpsum({ model }: { model: IPhoneModel }) {
  return (
    <div className="prose prose-sm prose-invert max-w-none mt-8 text-muted-foreground leading-relaxed">
      <h2 className="text-xl font-display font-bold text-foreground mb-3">
        Αλλαγή Οθόνης {model.name} στην Αθήνα
      </h2>
      <p>
        Η αντικατάσταση οθόνης {model.name} πραγματοποιείται καθημερινά στο εξειδικευμένο εργαστήριό μας στην Αθήνα. Χρησιμοποιούμε αποκλειστικά ανταλλακτικά υψηλής ποιότητας με πλήρη λειτουργικότητα αισθητήρων και αφής. Κάθε επισκευή συνοδεύεται από γραπτή εγγύηση και δωρεάν τεχνική διάγνωση.
      </p>
      <h3 className="text-lg font-display font-bold text-foreground mt-5 mb-2">
        Εξειδικευμένη Επισκευή {model.name}
      </h3>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <h3 className="text-lg font-display font-bold text-foreground mt-5 mb-2">
        Τι Περιλαμβάνει η Επισκευή
      </h3>
      <p>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
      </p>
      <p>
        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.
      </p>
      <h3 className="text-lg font-display font-bold text-foreground mt-5 mb-2">
        Εγγύηση & Ταχύτητα Επισκευής
      </h3>
      <p>
        Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus ut aut reiciendis voluptatibus maiores.
      </p>
      <p>
        Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.
      </p>
    </div>
  );
}

function SidebarProducts({ activeTab }: { activeTab: TabId }) {
  const subcategory = SIDEBAR_SUBCATEGORY[activeTab];
  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["/api/products", subcategory],
    queryFn: () => fetch(`/api/products?category=accessory&subcategory=${subcategory}`).then((r) => r.json()),
  });

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 border-b border-white/8 pb-2">
        {SIDEBAR_LABELS[activeTab]}
      </p>
      {products.length === 0 && (
        <p className="text-xs text-muted-foreground/50">Δεν βρέθηκαν προϊόντα.</p>
      )}
      {products.slice(0, 4).map((p: any) => (
        <Link key={p.id} href={`/eshop/${p.slug || p.id}`}>
          <div className="flex gap-3 p-2 rounded-xl border border-white/8 bg-white/2 hover:border-primary/30 hover:bg-primary/4 transition-all cursor-pointer group" data-testid={`sidebar-product-${p.id}`}>
            {p.imageUrl && (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-14 h-14 rounded-lg object-contain bg-white/5 shrink-0 p-1"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">{p.name}</p>
              <p className="text-sm font-extrabold text-primary mt-1">€{p.price}</p>
            </div>
          </div>
        </Link>
      ))}
      <Link href="/eshop">
        <Button size="sm" variant="outline" className={`${REPAIR_SIDEBAR_ESHOP} border-primary/30 text-primary hover:bg-primary/10`} data-testid="button-sidebar-eshop">
          <ShoppingCart className="w-3 h-3 mr-1.5" />
          Δείτε Όλα στο eShop
        </Button>
      </Link>
    </div>
  );
}

function TrustBadges() {
  return (
    <div className="grid grid-cols-3 gap-3 mt-6">
      {[
        { icon: Shield, label: "Εγγύηση", sub: "Γραπτή εγγύηση" },
        { icon: Clock, label: "30 λεπτά", sub: "Γρήγορη επισκευή" },
        { icon: Star, label: "Πιστοποιημένοι", sub: "Τεχνικοί Apple" },
      ].map((b) => (
        <div key={b.label} className="flex flex-col items-center text-center p-3 rounded-xl border border-white/8 bg-white/2">
          <b.icon className="w-5 h-5 text-primary mb-1.5" />
          <p className="text-xs font-bold text-foreground">{b.label}</p>
          <p className="text-[10px] text-muted-foreground">{b.sub}</p>
        </div>
      ))}
    </div>
  );
}

export default function IPhoneRepairDetail() {
  const [, params] = useRoute("/episkevi-iphone/:slug");
  const modelSlug = params?.slug ?? "";
  const baseModel = findModelBySlug(modelSlug);
  const priceMap = useRepairPriceOverrideMap();
  const model = useMemo(
    () => (baseModel ? mergeIphoneModel(baseModel, priceMap) : null),
    [baseModel, priceMap]
  );

  const [activeTab, setActiveTab] = useState<TabId>("screen");
  const [selectedScreenTier, setSelectedScreenTier] = useState(1);
  const [selectedBatteryTier, setSelectedBatteryTier] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  if (!model) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Μοντέλο δεν βρέθηκε</h1>
          <p className="text-muted-foreground mb-6">Το μοντέλο δεν υπάρχει στη βάση μας.</p>
          <Link href="/services/episkeui-iphone">
            <Button className="min-h-12 bg-primary px-6 text-base text-black touch-manipulation sm:min-h-10 sm:text-sm">← Επιστροφή στα μοντέλα iPhone</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const is15ProMax = model.slug === "15-pro-max";
  const pageTitle = is15ProMax
    ? "Αλλαγή Οθόνης & Μπαταρίας iPhone 15 Pro Max | Μοσχάτο"
    : `Επισκευή ${model.name} — Τιμές Αλλαγής Οθόνης, Μπαταρίας & Θύρας | HiTech Doctor Αθήνα`;
  const pageDesc = is15ProMax
    ? "Αλλαγή οθόνης & μπαταρίας iPhone 15 Pro Max στο Μοσχάτο από €220. Εξυπηρέτηση Ταύρος, Καλλιθέα, Πειραιάς & πανελλαδικά μέσω Box Now. Γραπτή εγγύηση. ☎ 6981 882 005"
    : `Επισκευή ${model.name} στην Αθήνα. Αλλαγή οθόνης από €${model.screenTiers[2].price}, μπαταρία €${model.batteryTiers[2].price}, θύρα φόρτισης €${model.chargingPortPrice}. Γνήσια & premium ανταλλακτικά, εγγύηση, αποτέλεσμα 30 λεπτά.`;
  const canonicalUrl = `https://hitechdoctor.com/episkevi-iphone/${model.slug}`;

  const selectedTier = activeTab === "screen"
    ? model.screenTiers[selectedScreenTier]
    : activeTab === "battery"
    ? model.batteryTiers[selectedBatteryTier]
    : null;

  const selectedTotalInclVat =
    activeTab === "screen"
      ? model.screenTiers[selectedScreenTier].price
      : activeTab === "battery"
        ? model.batteryTiers[selectedBatteryTier].price
        : model.chargingPortPrice;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `Επισκευή ${model.name}`,
    "provider": {
      "@type": "LocalBusiness",
      "name": "HiTech Doctor",
      "url": "https://hitechdoctor.com",
      "telephone": "+306981882005",
      "address": { "@type": "PostalAddress", "addressLocality": "Αθήνα", "addressCountry": "GR" },
    },
    "description": pageDesc,
    "serviceType": `Επισκευή ${model.name}`,
    "areaServed": "Αθήνα",
    "offers": [
      ...model.screenTiers.map((t) => ({
        "@type": "Offer",
        "name": `Αλλαγή Οθόνης ${model.name} — ${t.label}`,
        "price": t.price,
        "priceCurrency": "EUR",
      })),
      ...model.batteryTiers.map((t) => ({
        "@type": "Offer",
        "name": `Αλλαγή Μπαταρίας ${model.name} — ${t.label}`,
        "price": t.price,
        "priceCurrency": "EUR",
      })),
      {
        "@type": "Offer",
        "name": `Αλλαγή Θύρας Φόρτισης ${model.name}`,
        "price": model.chargingPortPrice,
        "priceCurrency": "EUR",
      },
    ],
  };

  const faqLd = is15ProMax
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Πόσο κοστίζει η αλλαγή οθόνης iPhone 15 Pro Max;",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Η αντικατάσταση οθόνης iPhone 15 Pro Max ξεκινά από €220 (Standard), €330 (Refurbished Premium) και €418 (Γνήσια Apple OEM). Στην τιμή περιλαμβάνεται ανταλλακτικό, εργασία και εγγύηση.",
            },
          },
          {
            "@type": "Question",
            "name": "Χάνεται το Face ID μετά από αλλαγή οθόνης iPhone 15 Pro Max;",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Όχι. Με τα κατάλληλα ανταλλακτικά και σωστή εγκατάσταση, το Face ID διατηρείται πλήρως. Μετά την επισκευή γίνεται έλεγχος Face ID.",
            },
          },
          {
            "@type": "Question",
            "name": "Τι είναι Refurbished Premium οθόνη iPhone;",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Ανακατασκευασμένη οθόνη υψηλής ποιότητας που λειτουργεί σχεδόν ταυτόσημα με γνήσια σε χαμηλότερη τιμή. Δες τον οδηγό: https://hitechdoctor.com/blog/refurbished-othones-iphone-ti-einai",
            },
          },
          {
            "@type": "Question",
            "name": "Εξυπηρετείτε εκτός Μοσχάτου;",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Ναι. Άμεσα: Μοσχάτο, Ταύρος, Καλλιθέα, Πειραιάς. Πανελλαδικά μέσω Box Now.",
            },
          },
        ],
      }
    : null;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Αρχική", "item": "https://hitechdoctor.com" },
      { "@type": "ListItem", "position": 2, "name": "Υπηρεσίες", "item": "https://hitechdoctor.com/services" },
      { "@type": "ListItem", "position": 3, "name": "Επισκευή iPhone", "item": "https://hitechdoctor.com/services/episkeui-iphone" },
      { "@type": "ListItem", "position": 4, "name": model.name, "item": canonicalUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-background circuit-bg">
      <Seo title={pageTitle} description={pageDesc} url={canonicalUrl} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
        {faqLd && <script type="application/ld+json">{JSON.stringify(faqLd)}</script>}
        <link rel="canonical" href={canonicalUrl} />
        <meta
          name="keywords"
          content={
            is15ProMax
              ? "αλλαγή οθόνης iPhone 15 Pro Max, επισκευή οθόνης iPhone 15 Pro Max, αντικατάσταση οθόνης iPhone 15 Pro Max, αλλαγή μπαταρίας iPhone 15 Pro Max, service iPhone 15 Pro Max Μοσχάτο, επισκευή iPhone Μοσχάτο, αλλαγή οθόνης iPhone Ταύρος, αλλαγή οθόνης iPhone Καλλιθέα, αλλαγή οθόνης iPhone Πειραιάς, αποστολή επισκευή iPhone Box Now"
              : `επισκευή ${model.name}, αλλαγή οθόνης ${model.name}, αλλαγή μπαταρίας ${model.name}, ${model.name} service Αθήνα`
          }
        />
      </Helmet>

      <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none -translate-x-1/3 -translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(0,210,200,0.06) 0%, transparent 70%)" }} />

      <Navbar />

      <main className="container mx-auto max-w-6xl px-4 pt-6 pb-8 md:pb-20">
        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <Link href="/services" className="hover:text-primary transition-colors">Υπηρεσίες</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <Link href="/services/episkeui-iphone" className="hover:text-primary transition-colors">Επισκευή iPhone</Link>
          <ChevronRight className="w-3 h-3 opacity-40" />
          <span className="text-foreground font-medium">{model.name}</span>
        </nav>

        {/* ── Hero ── */}
        <div className="flex flex-wrap items-start gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {model.tag && (
                <Badge className="bg-primary text-black text-[10px] font-bold">{model.tag}</Badge>
              )}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                model.port === "USB-C"
                  ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-400"
              }`}>{model.port}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-foreground leading-tight">
              Επισκευή {model.name}
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm">{model.screen} · Αθήνα, Ελλάδα</p>

            <div className="flex flex-wrap gap-3 mt-4">
              {[
                { icon: Shield, text: "Γραπτή Εγγύηση" },
                { icon: Clock,  text: "Από 30 λεπτά" },
                { icon: Wrench, text: "Δωρεάν Διάγνωση" },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <b.icon className="w-3.5 h-3.5 text-primary" />
                  {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Layout ── */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* ── Left: Tabs + Content ── */}
          <div className="lg:col-span-2">
            {/* Tab buttons */}
            <div className="flex gap-2 mb-6 border-b border-white/10 pb-1 overflow-x-auto">
              {TAB_DEFS.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`${REPAIR_TAB_BTN} ${
                    activeTab === t.id
                      ? "text-primary border-b-2 border-primary -mb-px"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`tab-${t.id}`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab hero image */}
            <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden mb-6 border border-white/8">
              <img
                src={TAB_IMAGES[activeTab]}
                alt={`${TAB_DEFS.find((t) => t.id === activeTab)?.label} ${model.name}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-display font-bold text-xl">{TAB_DEFS.find((t) => t.id === activeTab)?.label}</p>
                <p className="text-white/70 text-sm">{model.name}</p>
              </div>
            </div>

            {/* Screen Tab */}
            {activeTab === "screen" && (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Επιλέξτε ποιότητα ανταλλακτικού για την <strong className="text-foreground">Αλλαγή Οθόνης {model.name}</strong>:
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {model.screenTiers.map((tier, i) => (
                    <TierCard
                      key={tier.label}
                      tier={tier}
                      selected={selectedScreenTier === i}
                      onClick={() => setSelectedScreenTier(i)}
                    />
                  ))}
                </div>
                <div className="mt-5 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {model.screenTiers[selectedScreenTier].label} — Αλλαγή Οθόνης {model.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{model.screenTiers[selectedScreenTier].sublabel}</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                    <span className="text-2xl font-extrabold text-primary">€{model.screenTiers[selectedScreenTier].price}</span>
                    <Button
                      onClick={() => setModalOpen(true)}
                      className={REPAIR_CTA_GRADIENT}
                      style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                      data-testid="button-book-screen"
                    >
                      Κλείσε Ραντεβού
                    </Button>
                  </div>
                </div>
                <RepairPriceBreakdownCard totalInclVat={model.screenTiers[selectedScreenTier].price} className="mt-3" />
              </div>
            )}

            {/* Battery Tab */}
            {activeTab === "battery" && (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Επιλέξτε ποιότητα μπαταρίας για την <strong className="text-foreground">Αλλαγή Μπαταρίας {model.name}</strong>:
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {model.batteryTiers.map((tier, i) => (
                    <TierCard
                      key={tier.label}
                      tier={tier}
                      selected={selectedBatteryTier === i}
                      onClick={() => setSelectedBatteryTier(i)}
                    />
                  ))}
                </div>
                <div className="mt-5 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {model.batteryTiers[selectedBatteryTier].label} — Αλλαγή Μπαταρίας {model.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{model.batteryTiers[selectedBatteryTier].sublabel}</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                    <span className="text-2xl font-extrabold text-primary">€{model.batteryTiers[selectedBatteryTier].price}</span>
                    <Button
                      onClick={() => setModalOpen(true)}
                      className={REPAIR_CTA_GRADIENT}
                      style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                      data-testid="button-book-battery"
                    >
                      Κλείσε Ραντεβού
                    </Button>
                  </div>
                </div>
                <RepairPriceBreakdownCard totalInclVat={model.batteryTiers[selectedBatteryTier].price} className="mt-3" />
              </div>
            )}

            {/* Charging Port Tab */}
            {activeTab === "port" && (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Επισκευή / αντικατάσταση <strong className="text-foreground">Θύρας Φόρτισης {model.port}</strong> στο {model.name}:
                </p>
                <div className="rounded-2xl border border-white/10 bg-card p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-foreground">Αλλαγή Θύρας {model.port}</h3>
                      <p className="text-xs text-muted-foreground mt-1">Σταθερή τιμή — Ανεξαρτήτως μοντέλου</p>
                      <ul className="mt-3 space-y-1.5">
                        {[
                          `Αντικατάσταση ${model.port} connector`,
                          "Δοκιμή φόρτισης & data μεταφοράς",
                          "Καθαρισμός εσωτερικής λοβίτσας",
                          "Εγγύηση 6 μηνών εργασίας",
                        ].map((f) => (
                          <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-3xl font-extrabold text-primary">€{model.chargingPortPrice}</p>
                      <p className="text-[10px] text-muted-foreground">συμπ. εργατικά</p>
                    </div>
                  </div>
                  <div className="mt-5 border-t border-white/8 pt-4">
                    <Button
                      onClick={() => setModalOpen(true)}
                      className={REPAIR_CTA_WIDE}
                      style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                      data-testid="button-book-port"
                    >
                      Κλείσε Ραντεβού — €{model.chargingPortPrice}
                    </Button>
                  </div>
                  <RepairPriceBreakdownCard totalInclVat={model.chargingPortPrice} className="mt-4" />
                </div>

                <div className="mt-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                  <p className="text-xs font-semibold text-amber-400 mb-1">Σημείωση για {model.port} θύρα</p>
                  <p className="text-xs text-muted-foreground">
                    {model.port === "Lightning"
                      ? "Η θύρα Lightning είναι συνδεδεμένη με τη μητρική πλακέτα. Η επισκευή απαιτεί εξειδικευμένα εργαλεία microsolder."
                      : "Η θύρα USB-C στα νεότερα iPhone μπορεί να επισκευαστεί χωρίς αντικατάσταση της πλακέτας σε ποσοστό 90% των περιπτώσεων."}
                  </p>
                </div>
              </div>
            )}

            {/* SEO Content */}
            {model.slug === "13" ? <Seo13 /> : is15ProMax ? <Seo15ProMax /> : <SeoLoremIpsum model={model} />}

            {/* Other models in same series */}
            <div className="mt-10">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-3">Άλλα Μοντέλα iPhone</p>
              <div className="flex flex-wrap gap-2">
                {IPHONE_SERIES.flatMap((s) => s.models)
                  .filter((m) => m.slug !== model.slug)
                  .slice(0, 8)
                  .map((m) => (
                    <Link key={m.slug} href={`/episkevi-iphone/${m.slug}`}>
                      <span className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-card hover:border-primary/40 hover:text-primary text-muted-foreground transition-all cursor-pointer">
                        {m.name}
                      </span>
                    </Link>
                  ))}
              </div>
            </div>

            {/* Repair Form */}
            <div id="repair-form" className="mt-12 p-6 rounded-2xl border border-white/10 bg-card">
              <h2 className="text-xl font-display font-bold text-foreground mb-1">Αίτημα Επισκευής — {model.name}</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Συμπληρώστε τη φόρμα και θα επικοινωνήσουμε μαζί σας εντός 30 λεπτών.
              </p>
              <Button
                onClick={() => setModalOpen(true)}
                className={`${REPAIR_CTA_WIDE} shadow-[0_0_24px_rgba(0,210,200,0.25)]`}
                style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                data-testid="button-open-repair-form"
              >
                <Wrench className="w-4 h-4 mr-2" />
                Άνοιξε τη Φόρμα Επισκευής
              </Button>
              <div className="mt-4 flex flex-wrap gap-4">
                <a href="tel:+306981882005" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="w-4 h-4 text-primary" />
                  6981 882 005
                </a>
                <a href="mailto:info@hitechdoctor.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  info@hitechdoctor.com
                </a>
              </div>
            </div>
          </div>

          {/* ── Right: Sticky Sidebar ── */}
          <aside className="mt-10 lg:mt-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Price summary card */}
              <div className="rounded-2xl border border-white/10 bg-card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 border-b border-white/8 pb-2 mb-3">
                  Σύνοψη Τιμών
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Οθόνη Standard", price: model.screenTiers[2].price },
                    { label: "Μπαταρία Standard", price: model.batteryTiers[2].price },
                    { label: "Θύρα Φόρτισης", price: model.chargingPortPrice },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-bold text-foreground">από €{item.price}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => setModalOpen(true)}
                  className={`${REPAIR_CTA_FULL} mt-4`}
                  style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
                  data-testid="button-sidebar-book"
                >
                  Κλείσε Ραντεβού
                </Button>
                <a href="tel:+306981882005" className="flex items-center justify-center gap-2 mt-2 text-sm text-primary hover:underline" data-testid="link-sidebar-phone">
                  <Phone className="w-3.5 h-3.5" /> 6981 882 005
                </a>
                <PriceDisclaimer className="mt-3 pt-3 border-t border-white/5" />
              </div>

              {/* Trust Badges */}
              <TrustBadges />

              {/* Dynamic products based on tab */}
              <div className="rounded-2xl border border-white/10 bg-card p-4">
                <SidebarProducts activeTab={activeTab} />
              </div>
            </div>
          </aside>
        </div>
      </main>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RepairBottomProducts serviceType="screen" />
      </div>

      <Footer />

      <RepairRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultDeviceName={model.name}
        defaultTotalInclVat={selectedTotalInclVat}
        temperedGlassOffer={activeTab === "screen" || activeTab === "battery"}
      />
    </div>
  );
}
