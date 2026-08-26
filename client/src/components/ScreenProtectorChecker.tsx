import { useMemo, useState } from "react";
import { Search, Smartphone, Ruler, Layers, ScanFace, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  SCREEN_PROTECTOR_GROUPS,
  buildSearchSuggestions,
  deviceLabel,
  findPrimaryMatch,
  groupMatchesQuery,
  normalizeSearchQuery,
  totalDeviceCount,
  type ScreenProtectorDevice,
  type ScreenProtectorGroup,
} from "@/lib/screen-protector-data";

export type { ScreenProtectorDevice, ScreenProtectorGroup };

function SpecBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Ruler;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function GroupResultCard({
  group,
  query,
  highlightedDevice,
}: {
  group: ScreenProtectorGroup;
  query: string;
  highlightedDevice?: ScreenProtectorDevice;
}) {
  const primary = highlightedDevice ?? findPrimaryMatch(group, query);

  return (
    <Card className="overflow-hidden border-white/10 bg-white/[0.03] shadow-lg backdrop-blur-sm">
      <CardHeader className="space-y-3 border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg sm:text-xl">Αποτέλεσμα συμβατότητας</CardTitle>
            <CardDescription className="mt-1">
              {group.label
                ? `Τζάμι καταστήματος: ${group.label}`
                : "Η αναζητούμενη συσκευή ανήκει σε κοινή ομάδα τζαμιού"}
            </CardDescription>
          </div>
          <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden />
            100% Compatible Group
          </Badge>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-3 py-2.5">
          <Smartphone className="h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
          <div>
            <p className="text-xs text-cyan-200/80">Αναζητούμενη συσκευή</p>
            <p className="font-semibold text-foreground">{deviceLabel(primary)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <SpecBadge icon={Ruler} label="Μέγεθος οθόνης" value={group.screenSize} />
          <SpecBadge icon={Layers} label="Τύπος οθόνης" value={group.screenType} />
          <SpecBadge icon={ScanFace} label="Notch / Cutout" value={group.notchType} />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-foreground">
            Συμβατές συσκευές ({group.devices.length})
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {group.devices.map((device) => {
              const isHighlighted =
                device.brand === primary.brand && device.model === primary.model;
              return (
                <li
                  key={deviceLabel(device)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                    isHighlighted
                      ? "border-emerald-500/40 bg-emerald-500/10 font-medium text-emerald-100"
                      : "border-white/10 bg-white/[0.02] text-muted-foreground",
                  )}
                >
                  <Smartphone className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                  {deviceLabel(device)}
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export function ScreenProtectorChecker({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedDeviceKey, setSelectedDeviceKey] = useState<string | null>(null);

  const suggestions = useMemo(() => buildSearchSuggestions(query), [query]);

  const matchingGroups = useMemo(() => {
    const normalizedQuery = normalizeSearchQuery(query);
    if (!normalizedQuery) return [];
    return SCREEN_PROTECTOR_GROUPS.filter((group) => groupMatchesQuery(group, query));
  }, [query]);

  const activeGroup = useMemo(() => {
    if (selectedGroupId) {
      return SCREEN_PROTECTOR_GROUPS.find((group) => group.id === selectedGroupId) ?? null;
    }
    if (matchingGroups.length === 1) return matchingGroups[0];
    return null;
  }, [selectedGroupId, matchingGroups]);

  const highlightedDevice = useMemo(() => {
    if (!activeGroup) return undefined;
    if (selectedDeviceKey) {
      const found = activeGroup.devices.find(
        (device) => deviceLabel(device) === selectedDeviceKey,
      );
      if (found) return found;
    }
    return findPrimaryMatch(activeGroup, query);
  }, [activeGroup, selectedDeviceKey, query]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedGroupId(null);
    setSelectedDeviceKey(null);
  };

  const handleSelectSuggestion = (suggestion: {
    group: ScreenProtectorGroup;
    device: ScreenProtectorDevice;
  }) => {
    setQuery(deviceLabel(suggestion.device));
    setSelectedGroupId(suggestion.group.id);
    setSelectedDeviceKey(deviceLabel(suggestion.device));
  };

  const showSuggestions =
    normalizeSearchQuery(query).length > 0 && suggestions.length > 0 && !activeGroup;
  const showNoResults =
    normalizeSearchQuery(query).length > 0 &&
    suggestions.length === 0 &&
    matchingGroups.length === 0;

  return (
    <div className={cn("mx-auto w-full max-w-3xl space-y-6", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder='Πληκτρολογήστε μάρκα ή μοντέλο (π.χ. "Samsung A12", "iPhone 13", "Galaxy A55")'
          className="h-12 border-2 border-slate-300 bg-background pl-10 text-base shadow-sm focus-visible:border-primary/60 dark:border-slate-600 dark:bg-white/[0.04] dark:backdrop-blur-sm"
          aria-label="Αναζήτηση συσκευής για συμβατότητα τζαμιού"
          autoComplete="off"
          spellCheck={false}
        />

        {showSuggestions ? (
          <ul
            className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-white/10 bg-background/95 shadow-xl backdrop-blur-md"
            role="listbox"
            aria-label="Προτάσεις αναζήτησης"
          >
            {suggestions.map(({ group, device }) => (
              <li key={`${group.id}-${deviceLabel(device)}`} role="option">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-white/[0.06]"
                  onClick={() => handleSelectSuggestion({ group, device })}
                >
                  <span className="font-medium">{deviceLabel(device)}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {group.screenSize} · {group.screenType}
                    {group.devices.length > 1 ? ` · ${group.devices.length} συμβατές` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {!normalizeSearchQuery(query) ? (
        <p className="text-center text-sm text-muted-foreground">
          {SCREEN_PROTECTOR_GROUPS.length} ομάδες συμβατότητας ·{" "}
          {totalDeviceCount()} συσκευές στο dataset
        </p>
      ) : null}

      {showNoResults ? (
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="py-10 text-center">
            <p className="font-medium text-foreground">Δεν βρέθηκε συμβατή ομάδα</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Δοκιμάστε άλλη μάρκα ή μοντέλο (π.χ. «Galaxy A55», «Redmi Note 10», «iPhone 14»).
            </p>
          </CardContent>
        </Card>
      ) : null}

      {activeGroup ? (
        <GroupResultCard
          group={activeGroup}
          query={query}
          highlightedDevice={highlightedDevice}
        />
      ) : null}

      {!activeGroup && matchingGroups.length > 1 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Βρέθηκαν {matchingGroups.length} ομάδες — επιλέξτε μία:
          </p>
          <div className="grid gap-3">
            {matchingGroups.map((group) => {
              const device = findPrimaryMatch(group, query);
              return (
                <button
                  key={group.id}
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-colors hover:border-cyan-500/30 hover:bg-white/[0.06]"
                  onClick={() => {
                    setSelectedGroupId(group.id);
                    setSelectedDeviceKey(deviceLabel(device));
                  }}
                >
                  <p className="font-medium">{deviceLabel(device)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {group.devices.length} συμβατές · {group.screenSize} · {group.screenType}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ScreenProtectorChecker;
