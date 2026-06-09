"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SubmissionStatus } from "@/lib/prisma-enums";

import { CrmSubmissionEditor } from "@/components/forms/CrmSubmissionEditor";
import type { BlockedIpRecord, CrmRecord } from "@/lib/content-repository";

const STATUS_AR: Record<SubmissionStatus, string> = {
  NEW: "جديد",
  CONTACTED: "تم التواصل",
  FOLLOW_UP: "متابعة",
  BOOKED: "محجوز",
  CLOSED: "مغلق",
};

const STATUS_BADGE: Record<SubmissionStatus, string> = {
  NEW: "is-draft",
  CONTACTED: "is-review",
  FOLLOW_UP: "is-review",
  BOOKED: "is-published",
  CLOSED: "is-archived",
};

const STATUS_ORDER: SubmissionStatus[] = [
  SubmissionStatus.NEW,
  SubmissionStatus.CONTACTED,
  SubmissionStatus.FOLLOW_UP,
  SubmissionStatus.BOOKED,
  SubmissionStatus.CLOSED,
];

type FilterStatus = SubmissionStatus | "ALL";
type RangePreset = "today" | "7d" | "30d" | "90d" | "all";
type SortKey = "createdAt" | "lastInteraction" | "status" | "source" | "owner";
type SortDirection = "asc" | "desc";
type BulkAction = "status" | "assign" | "source" | "archive" | "delete";
type ToastState = { type: "success" | "error" | "info"; message: string };
type CrmApiResult = {
  status: "success" | "error";
  message: string;
  affected?: number;
};
type BlockedIpApiResult = CrmApiResult & {
  items?: BlockedIpRecord[];
  item?: BlockedIpRecord;
};
type AdvancedFilters = {
  last24: boolean;
  last7: boolean;
  last30: boolean;
  unassignedOnly: boolean;
  newOnly: boolean;
  lateOnly: boolean;
  webhookOnly: boolean;
  landingOnly: boolean;
  unopenedOnly: boolean;
  noSourceOnly: boolean;
  duplicatesOnly: boolean;
};

const emptyAdvancedFilters: AdvancedFilters = {
  last24: false,
  last7: false,
  last30: false,
  unassignedOnly: false,
  newOnly: false,
  lateOnly: false,
  webhookOnly: false,
  landingOnly: false,
  unopenedOnly: false,
  noSourceOnly: false,
  duplicatesOnly: false,
};

function formatArabicDateTime(iso?: string) {
  if (!iso) return "غير محدد";
  try {
    return new Intl.DateTimeFormat("ar-SA", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Riyadh",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatArabicDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("ar-SA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Riyadh",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatTimeAgo(iso: string, now: number) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} س`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

function whatsappHref(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  const normalized = digits.startsWith("966")
    ? digits
    : digits.startsWith("0")
      ? `966${digits.slice(1)}`
      : digits;
  return normalized ? `https://wa.me/${normalized}` : "#";
}

function todayInputValue() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function translateSource(value?: string) {
  const source = value?.trim() || "غير محدد";
  const normalized = source.toLowerCase();
  if (normalized.includes("header booking")) return "نموذج الحجز العلوي";
  if (normalized.includes("homepage")) return "نموذج الصفحة الرئيسية";
  if (normalized.includes("website")) return "الموقع الإلكتروني";
  if (normalized.includes("landing")) return "صفحة هبوط";
  if (normalized === "webhook" || normalized.includes("webhook")) {
    return "ويب هوك";
  }
  return source;
}

function leadSource(submission: CrmRecord) {
  return (
    submission.source?.trim() ||
    submission.webhookName?.trim() ||
    "غير محدد"
  );
}

function leadUtmSource(submission: CrmRecord) {
  return submission.utmSource?.trim() ?? "";
}

function leadSourceDisplay(submission: CrmRecord) {
  const translated = translateSource(leadSource(submission));
  const utmSource = leadUtmSource(submission);
  if (!utmSource) return translated;

  const normalizedTranslated = normalizeText(translated);
  const normalizedUtmSource = normalizeText(utmSource);
  if (normalizedUtmSource && normalizedTranslated.includes(normalizedUtmSource)) {
    return translated;
  }

  return `${translated} · ${utmSource}`;
}

function leadSourceTitle(submission: CrmRecord) {
  const source = leadSource(submission);
  const utmSource = leadUtmSource(submission);
  return utmSource ? `${source} · utm_source=${utmSource}` : source;
}

const COUNTRY_LABELS: Record<string, string> = {
  SA: "السعودية",
  AE: "الإمارات",
  EG: "مصر",
  KW: "الكويت",
  QA: "قطر",
  BH: "البحرين",
  OM: "عمان",
  US: "الولايات المتحدة",
  GB: "المملكة المتحدة",
};

function missingLeadMeta(value?: string) {
  return value?.trim() || "غير متاح";
}

function countryLabel(value?: string) {
  const clean = value?.trim();
  if (!clean) return "غير متاح";
  const code = clean.toUpperCase();
  return COUNTRY_LABELS[code] ? `${COUNTRY_LABELS[code]} (${code})` : clean;
}

function compactUrl(value?: string) {
  const clean = value?.trim();
  if (!clean) return "غير متاح";
  try {
    const url = new URL(clean);
    return `${url.hostname}${url.pathname}${url.search}`;
  } catch {
    return clean;
  }
}

function matchVersion(userAgent: string, pattern: RegExp) {
  return userAgent.match(pattern)?.[1];
}

function parseUserAgent(userAgent?: string) {
  const ua = userAgent?.trim();
  if (!ua) {
    return {
      label: "غير متاح",
      browser: "غير متاح",
      os: "غير متاح",
      device: "غير متاح",
      isBot: false,
    };
  }

  const isBot = /bot|crawl|spider|slurp|facebookexternalhit|preview/i.test(ua);
  const browserCandidates: Array<[string, string | undefined]> = [
    ["Samsung Internet", matchVersion(ua, /SamsungBrowser\/([\d.]+)/i)],
    ["Microsoft Edge", matchVersion(ua, /EdgA?\/([\d.]+)/i)],
    ["Opera", matchVersion(ua, /OPR\/([\d.]+)/i)],
    ["Chrome iOS", matchVersion(ua, /CriOS\/([\d.]+)/i)],
    ["Chrome", matchVersion(ua, /Chrome\/([\d.]+)/i)],
    ["Firefox iOS", matchVersion(ua, /FxiOS\/([\d.]+)/i)],
    ["Firefox", matchVersion(ua, /Firefox\/([\d.]+)/i)],
    ["Safari", matchVersion(ua, /Version\/([\d.]+).*Safari/i)],
  ];
  const browserMatch = browserCandidates.find(([, version]) => version);
  const browser = browserMatch
    ? `${browserMatch[0]} ${String(browserMatch[1]).split(".")[0]}`
    : isBot
      ? "Bot / Crawler"
      : "متصفح غير محدد";

  const android = matchVersion(ua, /Android\s+([\d.]+)/i);
  const ios = matchVersion(ua, /(?:iPhone OS|CPU OS)\s+([\d_]+)/i)?.replace(
    /_/g,
    ".",
  );
  const mac = matchVersion(ua, /Mac OS X\s+([\d_]+)/i)?.replace(/_/g, ".");
  const os = android
    ? `Android ${android}`
    : ios
      ? `iOS ${ios}`
      : /Windows NT/i.test(ua)
        ? "Windows"
        : mac
          ? `macOS ${mac}`
          : /Linux/i.test(ua)
            ? "Linux"
            : "نظام غير محدد";
  const device = isBot
    ? "Bot"
    : /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))
      ? "Tablet"
      : /Mobi|Android|iPhone/i.test(ua)
        ? "Mobile"
        : "Desktop";

  return {
    label: `${browser} · ${os} · ${device}`,
    browser,
    os,
    device,
    isBot,
  };
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("966")) return digits.slice(3);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

function getLastInteractionIso(submission: CrmRecord) {
  return (
    submission.comments[0]?.createdAt ??
    submission.updatedAt ??
    submission.createdAt
  );
}

function withinSameSaudiDay(iso: string | undefined, now: number) {
  if (!iso) return false;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date(iso)) === formatter.format(new Date(now));
}

function dateInputToStart(value: string) {
  return value ? new Date(`${value}T00:00:00+03:00`).getTime() : null;
}

function dateInputToEnd(value: string) {
  return value ? new Date(`${value}T23:59:59+03:00`).getTime() : null;
}

function matchesSearch(submission: CrmRecord, rawTerm: string) {
  const term = normalizeText(rawTerm);
  const phoneTerm = normalizePhone(rawTerm);
  if (!term && !phoneTerm) return true;

  const haystack = normalizeText(
    [
      submission.fullName,
      submission.phone,
      submission.email ?? "",
      submission.serviceLabel ?? "",
      leadSource(submission),
      submission.webhookName ?? "",
      submission.assignedToName ?? "",
      STATUS_AR[submission.status],
      submission.message ?? "",
      submission.notes ?? "",
      submission.utmSource ?? "",
      submission.utmMedium ?? "",
      submission.utmCampaign ?? "",
      submission.utmContent ?? "",
      submission.ipAddress ?? "",
      submission.userAgent ?? "",
      (submission.tags ?? []).join(" "),
    ].join(" "),
  );

  const phone = normalizePhone(submission.phone);
  return haystack.includes(term) || (!!phoneTerm && phone.includes(phoneTerm));
}

function compareValues(
  left: string | number,
  right: string | number,
  direction: SortDirection,
) {
  const modifier = direction === "asc" ? 1 : -1;
  if (typeof left === "number" && typeof right === "number") {
    return (left - right) * modifier;
  }
  return String(left).localeCompare(String(right), "ar") * modifier;
}

function buildExportUrl(
  ids: readonly string[],
  query = "",
  format: "csv" | "xlsx" = "xlsx",
) {
  const params = new URLSearchParams(query);
  params.set("format", format);
  if (ids.length) params.set("ids", ids.join(","));
  return `/api/admin/crm/export?${params.toString()}`;
}

function statusSortValue(status: SubmissionStatus) {
  return STATUS_ORDER.indexOf(status);
}

function filterBool(value: string | null) {
  return value === "1" || value === "true";
}

function SortButton({
  label,
  sortKey,
  currentKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  const active = currentKey === sortKey;
  return (
    <button
      type="button"
      className="admin-crm-sort"
      aria-pressed={active}
      onClick={() => onSort(sortKey)}
    >
      {label}
      <span aria-hidden="true">{active ? (direction === "asc" ? "↑" : "↓") : "↕"}</span>
    </button>
  );
}

export function CrmFilterBar({
  submissions,
  services,
  staff,
  blockedIps,
  canDelete = false,
  canDeleteComments = false,
  initialNow,
}: {
  submissions: ReadonlyArray<CrmRecord>;
  services: ReadonlyArray<{ slug: string; name: string }>;
  staff: ReadonlyArray<{ id: string; name: string }>;
  blockedIps: ReadonlyArray<BlockedIpRecord>;
  canDelete?: boolean;
  canDeleteComments?: boolean;
  initialNow: number;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<FilterStatus>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("ALL");
  const [ipFilter, setIpFilter] = useState("");
  const [service, setService] = useState("ALL");
  const [tag, setTag] = useState("ALL");
  const [owner, setOwner] = useState("ALL");
  const [range, setRange] = useState<RangePreset>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advanced, setAdvanced] =
    useState<AdvancedFilters>(emptyAdvancedFilters);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("lastInteraction");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [bulkStatus, setBulkStatus] = useState<SubmissionStatus>(
    SubmissionStatus.CONTACTED,
  );
  const [bulkAssignee, setBulkAssignee] = useState("");
  const [bulkSource, setBulkSource] = useState("");
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);
  const [ipBlockCandidate, setIpBlockCandidate] = useState<CrmRecord | null>(
    null,
  );
  const [ipBlockReason, setIpBlockReason] = useState("");
  const [blockedIpItems, setBlockedIpItems] = useState<BlockedIpRecord[]>([
    ...blockedIps,
  ]);
  const [deleteCandidate, setDeleteCandidate] = useState<CrmRecord | null>(
    null,
  );
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isBulkPending, startBulkTransition] = useTransition();
  const [isIpBlockPending, setIsIpBlockPending] = useState(false);
  const [isDeletePending, setIsDeletePending] = useState(false);
  const [statusUpdateId, setStatusUpdateId] = useState<string | null>(null);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [nowSnapshot] = useState(initialNow);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const saved = window.localStorage.getItem("rejuvera-crm-filters");
    const savedParams = saved ? new URLSearchParams(saved) : null;
    const sourceParams = params.toString() ? params : savedParams;

    if (sourceParams) {
      const nextStatus = sourceParams.get("status");
      if (nextStatus === "ALL" || STATUS_ORDER.includes(nextStatus as SubmissionStatus)) {
        setStatus(nextStatus as FilterStatus);
      }
      setSearchInput(sourceParams.get("search") ?? "");
      setSearch(sourceParams.get("search") ?? "");
      setSource(sourceParams.get("source") ?? "ALL");
      setIpFilter(sourceParams.get("ip") ?? "");
      setService(sourceParams.get("service") ?? "ALL");
      setOwner(sourceParams.get("owner") ?? "ALL");
      setTag(sourceParams.get("tag") ?? "ALL");
      setRange((sourceParams.get("range") as RangePreset) ?? "all");
      setFromDate(sourceParams.get("from") ?? "");
      setToDate(sourceParams.get("to") ?? "");
      setShowAdvanced(filterBool(sourceParams.get("advanced")));
      setAdvanced({
        last24: filterBool(sourceParams.get("last24")),
        last7: filterBool(sourceParams.get("last7")),
        last30: filterBool(sourceParams.get("last30")),
        unassignedOnly: filterBool(sourceParams.get("unassignedOnly")),
        newOnly: filterBool(sourceParams.get("newOnly")),
        lateOnly: filterBool(sourceParams.get("lateOnly")),
        webhookOnly: filterBool(sourceParams.get("webhookOnly")),
        landingOnly: filterBool(sourceParams.get("landingOnly")),
        unopenedOnly: filterBool(sourceParams.get("unopenedOnly")),
        noSourceOnly: filterBool(sourceParams.get("noSourceOnly")),
        duplicatesOnly: filterBool(sourceParams.get("duplicatesOnly")),
      });
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setIsSearchPending(true);
    const timeout = window.setTimeout(() => {
      setSearch(searchInput);
      setIsSearchPending(false);
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (!isHydrated) return;
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", status);
    if (source !== "ALL") params.set("source", source);
    if (ipFilter.trim()) params.set("ip", ipFilter.trim());
    if (service !== "ALL") params.set("service", service);
    if (owner !== "ALL") params.set("owner", owner);
    if (tag !== "ALL") params.set("tag", tag);
    if (range !== "all") params.set("range", range);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    if (search.trim()) params.set("search", search.trim());
    if (showAdvanced) params.set("advanced", "1");
    Object.entries(advanced).forEach(([key, value]) => {
      if (value) params.set(key, "1");
    });
    const query = params.toString();
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
    window.localStorage.setItem("rejuvera-crm-filters", query);
  }, [
    advanced,
    fromDate,
    ipFilter,
    isHydrated,
    owner,
    range,
    search,
    service,
    showAdvanced,
    source,
    status,
    tag,
    toDate,
  ]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    setBlockedIpItems([...blockedIps]);
  }, [blockedIps]);

  useEffect(() => {
    const availableIds = new Set(submissions.map((item) => item.id));
    setSelectedIds((ids) => ids.filter((id) => availableIds.has(id)));
  }, [submissions]);

  const allSources = useMemo(() => {
    const counts = new Map<string, number>();
    submissions.forEach((item) => {
      const value = leadSource(item);
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((left, right) => {
      if (right[1] !== left[1]) return right[1] - left[1];
      return translateSource(left[0]).localeCompare(translateSource(right[0]), "ar");
    });
  }, [submissions]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((item) =>
      (item.tags ?? []).forEach((tagValue) => set.add(tagValue)),
    );
    return Array.from(set).sort((left, right) =>
      left.localeCompare(right, "ar"),
    );
  }, [submissions]);

  const duplicatePhones = useMemo(() => {
    const counts = new Map<string, number>();
    submissions.forEach((item) => {
      const phone = normalizePhone(item.phone);
      if (!phone) return;
      counts.set(phone, (counts.get(phone) ?? 0) + 1);
    });
    return counts;
  }, [submissions]);

  const filtered = useMemo(() => {
    const presetDays =
      range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : null;
    const presetCutoff = presetDays
      ? nowSnapshot - presetDays * 86_400_000
      : null;
    const fromTime = dateInputToStart(fromDate);
    const toTime = dateInputToEnd(toDate);
    const nowMinus24 = nowSnapshot - 86_400_000;
    const nowMinus7 = nowSnapshot - 7 * 86_400_000;
    const nowMinus30 = nowSnapshot - 30 * 86_400_000;

    return submissions.filter((submission) => {
      if (status !== "ALL" && submission.status !== status) return false;
      if (source !== "ALL" && leadSource(submission) !== source) return false;
      if (
        ipFilter.trim() &&
        !submission.ipAddress
          ?.toLowerCase()
          .includes(ipFilter.trim().toLowerCase())
      ) {
        return false;
      }
      if (service !== "ALL" && submission.serviceSlug !== service) return false;
      if (tag !== "ALL" && !(submission.tags ?? []).includes(tag)) return false;
      if (owner !== "ALL") {
        if (owner === "_unassigned" && submission.assignedToId) return false;
        if (owner !== "_unassigned" && submission.assignedToId !== owner) {
          return false;
        }
      }

      const created = new Date(submission.createdAt).getTime();
      if (range === "today" && !withinSameSaudiDay(submission.createdAt, nowSnapshot)) {
        return false;
      }
      if (presetCutoff && created < presetCutoff) return false;
      if (fromTime && created < fromTime) return false;
      if (toTime && created > toTime) return false;
      if (!matchesSearch(submission, search)) return false;

      if (advanced.last24 && created < nowMinus24) return false;
      if (advanced.last7 && created < nowMinus7) return false;
      if (advanced.last30 && created < nowMinus30) return false;
      if (advanced.unassignedOnly && submission.assignedToId) return false;
      if (advanced.newOnly && submission.status !== SubmissionStatus.NEW) return false;
      if (
        advanced.lateOnly &&
        (created >= nowMinus24 ||
          submission.status === SubmissionStatus.BOOKED ||
          submission.status === SubmissionStatus.CLOSED)
      ) {
        return false;
      }
      if (advanced.webhookOnly && !submission.webhookId && !submission.webhookName) {
        return false;
      }
      if (
        advanced.landingOnly &&
        !normalizeText(leadSource(submission)).includes("landing") &&
        !leadSource(submission).includes("هبوط")
      ) {
        return false;
      }
      if (
        advanced.unopenedOnly &&
        (submission.comments.length > 0 || submission.status !== SubmissionStatus.NEW)
      ) {
        return false;
      }
      if (advanced.noSourceOnly && leadSource(submission) !== "غير محدد") {
        return false;
      }
      if (
        advanced.duplicatesOnly &&
        (duplicatePhones.get(normalizePhone(submission.phone)) ?? 0) < 2
      ) {
        return false;
      }
      return true;
    });
  }, [
    advanced,
    duplicatePhones,
    fromDate,
    ipFilter,
    nowSnapshot,
    owner,
    range,
    search,
    service,
    source,
    status,
    submissions,
    tag,
    toDate,
  ]);

  const visibleLeads = useMemo(() => {
    return [...filtered].sort((left, right) => {
      if (sortKey === "createdAt") {
        return compareValues(
          new Date(left.createdAt).getTime(),
          new Date(right.createdAt).getTime(),
          sortDirection,
        );
      }
      if (sortKey === "lastInteraction") {
        return compareValues(
          new Date(getLastInteractionIso(left)).getTime(),
          new Date(getLastInteractionIso(right)).getTime(),
          sortDirection,
        );
      }
      if (sortKey === "status") {
        return compareValues(
          statusSortValue(left.status),
          statusSortValue(right.status),
          sortDirection,
        );
      }
      if (sortKey === "source") {
        return compareValues(leadSource(left), leadSource(right), sortDirection);
      }
      return compareValues(
        left.assignedToName ?? "zzz",
        right.assignedToName ?? "zzz",
        sortDirection,
      );
    });
  }, [filtered, sortDirection, sortKey]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visibleIds = useMemo(() => visibleLeads.map((item) => item.id), [visibleLeads]);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedSet.has(id));
  const selectedCount = selectedIds.length;

  const pipeline = useMemo(
    () =>
      STATUS_ORDER.map((stage) => ({
        stage,
        total: filtered.filter((item) => item.status === stage).length,
      })),
    [filtered],
  );

  const dailyCount = filtered.filter((item) =>
    withinSameSaudiDay(item.createdAt, nowSnapshot),
  ).length;
  const unassignedCount = filtered.filter((item) => !item.assignedToId).length;
  const campaignCount = filtered.filter(
    (item) => item.utmSource || item.utmMedium || item.utmCampaign,
  ).length;
  const bookedCount = filtered.filter(
    (item) => item.status === SubmissionStatus.BOOKED,
  ).length;
  const selectedSubmission = selectedLeadId
    ? (submissions.find((item) => item.id === selectedLeadId) ?? null)
    : null;
  const activeBlockedIps = useMemo(
    () => blockedIpItems.filter((item) => item.isActive),
    [blockedIpItems],
  );
  const isSelectedIpBlocked = selectedSubmission?.ipAddress
    ? activeBlockedIps.some((item) => item.ipAddress === selectedSubmission.ipAddress)
    : false;

  useEffect(() => {
    if (!selectedSubmission) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedLeadId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedSubmission]);

  useEffect(() => {
    if (!confirmAction && !deleteCandidate && !ipBlockCandidate) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setConfirmAction(null);
        setDeleteCandidate(null);
        setIpBlockCandidate(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [confirmAction, deleteCandidate, ipBlockCandidate]);

  const exportQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", status);
    if (source !== "ALL") params.set("source", source);
    if (ipFilter.trim()) params.set("ip", ipFilter.trim());
    if (service !== "ALL") params.set("service", service);
    if (owner !== "ALL") params.set("owner", owner);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    if (search.trim()) params.set("search", search.trim());
    return params.toString();
  }, [fromDate, ipFilter, owner, search, service, source, status, toDate]);

  const activeFilterCount = useMemo(() => {
    let total = 0;
    if (status !== "ALL") total += 1;
    if (source !== "ALL") total += 1;
    if (ipFilter.trim()) total += 1;
    if (service !== "ALL") total += 1;
    if (owner !== "ALL") total += 1;
    if (tag !== "ALL") total += 1;
    if (range !== "all") total += 1;
    if (fromDate) total += 1;
    if (toDate) total += 1;
    if (search.trim()) total += 1;
    total += Object.values(advanced).filter(Boolean).length;
    return total;
  }, [advanced, fromDate, ipFilter, owner, range, search, service, source, status, tag, toDate]);

  const resetFilters = () => {
    setStatus("ALL");
    setSearchInput("");
    setSearch("");
    setSource("ALL");
    setIpFilter("");
    setService("ALL");
    setTag("ALL");
    setOwner("ALL");
    setRange("all");
    setFromDate("");
    setToDate("");
    setAdvanced(emptyAdvancedFilters);
  };

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "owner" || key === "source" ? "asc" : "desc");
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
    );
  };

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((ids) => ids.filter((id) => !visibleIds.includes(id)));
      return;
    }
    setSelectedIds((ids) => Array.from(new Set([...ids, ...visibleIds])));
  };

  const copyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setToast({ type: "success", message: "تم نسخ رقم الجوال." });
    } catch {
      setToast({ type: "error", message: "تعذر نسخ الرقم من المتصفح الحالي." });
    }
  };

  const submitBulkAction = (action: BulkAction) => {
    if (selectedIds.length === 0) {
      setToast({ type: "error", message: "حدد طلبًا واحدًا على الأقل أولًا." });
      return;
    }
    const formData = new FormData();
    formData.set("action", action);
    formData.set("ids", selectedIds.join(","));
    if (action === "status") formData.set("status", bulkStatus);
    if (action === "assign") formData.set("assignedToId", bulkAssignee);
    if (action === "source") formData.set("source", bulkSource);

    startBulkTransition(async () => {
      try {
        const response = await fetch("/api/admin/crm", {
          method: "PATCH",
          body: formData,
        });
        const result = (await response.json().catch(() => null)) as
          | CrmApiResult
          | null;
        const succeeded = response.ok && result?.status === "success";
        setToast({
          type: succeeded ? "success" : "error",
          message:
            result?.message ??
            "تعذر تنفيذ الإجراء الجماعي. الرجاء المحاولة مرة أخرى.",
        });
        if (succeeded) {
          setSelectedIds([]);
          setConfirmAction(null);
          router.refresh();
        }
      } catch {
        setToast({
          type: "error",
          message: "تعذر الاتصال بالخادم لتنفيذ الإجراء الجماعي.",
        });
      }
    });
  };

  const deleteLead = async (submission: CrmRecord) => {
    if (!canDelete || isDeletePending) return;
    setIsDeletePending(true);
    try {
      const response = await fetch(
        `/api/admin/crm?id=${encodeURIComponent(submission.id)}&type=lead`,
        { method: "DELETE" },
      );
      const result = (await response.json().catch(() => null)) as
        | CrmApiResult
        | null;
      const succeeded = response.ok && result?.status === "success";
      setToast({
        type: succeeded ? "success" : "error",
        message:
          result?.message ??
          "تعذر حذف الطلب. الرجاء تحديث الصفحة والمحاولة مرة أخرى.",
      });
      if (succeeded) {
        setDeleteCandidate(null);
        setSelectedLeadId(null);
        setSelectedIds((ids) => ids.filter((id) => id !== submission.id));
        router.refresh();
      }
    } catch {
      setToast({
        type: "error",
        message: "تعذر الاتصال بالخادم لحذف الطلب.",
      });
    } finally {
      setIsDeletePending(false);
    }
  };

  const updateLeadStatus = async (formData: FormData) => {
    const id = String(formData.get("id") ?? "");
    if (!id || statusUpdateId) return;
    setStatusUpdateId(id);
    try {
      const response = await fetch("/api/admin/crm", {
        method: "PUT",
        body: formData,
      });
      const result = (await response.json().catch(() => null)) as
        | CrmApiResult
        | null;
      const succeeded = response.ok && result?.status === "success";
      setToast({
        type: succeeded ? "success" : "error",
        message:
          result?.message ??
          "تعذر تحديث حالة الطلب. الرجاء المحاولة مرة أخرى.",
      });
      if (succeeded) {
        router.refresh();
      }
    } catch {
      setToast({
        type: "error",
        message: "تعذر الاتصال بالخادم لتحديث حالة الطلب.",
      });
    } finally {
      setStatusUpdateId(null);
    }
  };

  const blockSelectedIp = async () => {
    if (!canDelete || !ipBlockCandidate?.ipAddress || isIpBlockPending) return;
    setIsIpBlockPending(true);
    try {
      const response = await fetch("/api/admin/blocked-ips", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ipAddress: ipBlockCandidate.ipAddress,
          reason:
            ipBlockReason.trim() ||
            `Lead ${ipBlockCandidate.id} - ${ipBlockCandidate.fullName}`,
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | BlockedIpApiResult
        | null;
      const succeeded = response.ok && result?.status === "success";
      setToast({
        type: succeeded ? "success" : "error",
        message:
          result?.message ??
          "تعذر حظر الـ IP حاليًا. الرجاء المحاولة مرة أخرى.",
      });
      if (succeeded && result?.item) {
        setBlockedIpItems((items) => {
          const withoutCurrent = items.filter(
            (item) => item.ipAddress !== result.item?.ipAddress,
          );
          return [result.item as BlockedIpRecord, ...withoutCurrent];
        });
        setIpBlockCandidate(null);
        setIpBlockReason("");
        router.refresh();
      }
    } catch {
      setToast({
        type: "error",
        message: "تعذر الاتصال بالخادم لحظر الـ IP.",
      });
    } finally {
      setIsIpBlockPending(false);
    }
  };

  const unblockIp = async (item: BlockedIpRecord) => {
    if (!canDelete || isIpBlockPending) return;
    setIsIpBlockPending(true);
    try {
      const response = await fetch(
        `/api/admin/blocked-ips?id=${encodeURIComponent(item.id)}`,
        { method: "DELETE" },
      );
      const result = (await response.json().catch(() => null)) as
        | BlockedIpApiResult
        | null;
      const succeeded = response.ok && result?.status === "success";
      setToast({
        type: succeeded ? "success" : "error",
        message:
          result?.message ??
          "تعذر فك حظر الـ IP حاليًا. الرجاء المحاولة مرة أخرى.",
      });
      if (succeeded) {
        setBlockedIpItems((items) =>
          items.map((blocked) =>
            blocked.id === item.id ? { ...blocked, isActive: false } : blocked,
          ),
        );
        router.refresh();
      }
    } catch {
      setToast({
        type: "error",
        message: "تعذر الاتصال بالخادم لفك حظر الـ IP.",
      });
    } finally {
      setIsIpBlockPending(false);
    }
  };

  const advancedOptions: Array<{
    key: keyof AdvancedFilters;
    label: string;
  }> = [
    { key: "last24", label: "آخر 24 ساعة" },
    { key: "last7", label: "آخر 7 أيام" },
    { key: "last30", label: "آخر 30 يوم" },
    { key: "unassignedOnly", label: "بدون مسؤول" },
    { key: "newOnly", label: "الطلبات الجديدة فقط" },
    { key: "lateOnly", label: "طلبات متأخرة" },
    { key: "webhookOnly", label: "قادمة من Webhook" },
    { key: "landingOnly", label: "قادمة من صفحة هبوط" },
    { key: "unopenedOnly", label: "لم يتم فتحها" },
    { key: "noSourceOnly", label: "بدون مصدر" },
    { key: "duplicatesOnly", label: "مكررة حسب الجوال" },
  ];

  return (
    <div className="admin-crm-workspace">
      {toast ? (
        <div className={`admin-crm-toast is-${toast.type}`} role="status">
          {toast.message}
        </div>
      ) : null}

      <section className="admin-crm-filter-panel">
        <div className="admin-crm-filter-panel__head">
          <div>
            <span className="admin-field-label">تصفية الطلبات</span>
            <h2>{visibleLeads.length} نتيجة مطابقة</h2>
            {activeFilterCount ? (
              <p className="admin-crm-filter-hint">
                {activeFilterCount} فلتر نشط. يمكنك مشاركة الرابط بنفس الفلاتر.
              </p>
            ) : null}
          </div>
          <div className="admin-crm-filter-panel__exports">
            <a className="admin-btn-secondary" href={buildExportUrl([], exportQuery)}>
              Excel منسق
            </a>
            <a className="admin-btn-secondary" href={buildExportUrl([], exportQuery, "csv")}>
              CSV
            </a>
            <a
              className="admin-btn-secondary"
              href={`/api/admin/crm/export?format=pdf${exportQuery ? `&${exportQuery}` : ""}`}
            >
              تقرير PDF
            </a>
          </div>
        </div>

        <div className="admin-crm-filter-grid">
          <label className="admin-crm-search-label">
            <span>بحث شامل</span>
            <div className="admin-crm-search-field">
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="اسم / جوال / خدمة / مصدر / مسؤول"
                className="admin-input"
              />
              {searchInput ? (
                <button type="button" onClick={() => setSearchInput("")}>
                  مسح
                </button>
              ) : null}
            </div>
            {isSearchPending ? <em>جاري البحث...</em> : null}
          </label>
          <label>
            <span>الحالة</span>
            <select
              className="admin-input"
              value={status}
              onChange={(event) => setStatus(event.target.value as FilterStatus)}
            >
              <option value="ALL">كل الحالات</option>
              {STATUS_ORDER.map((value) => (
                <option key={value} value={value}>
                  {STATUS_AR[value]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>الخدمة</span>
            <select
              className="admin-input"
              value={service}
              onChange={(event) => setService(event.target.value)}
            >
              <option value="ALL">كل الخدمات</option>
              {services.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>المصدر</span>
            <select
              className="admin-input"
              value={source}
              onChange={(event) => setSource(event.target.value)}
            >
              <option value="ALL">كل المصادر</option>
              {allSources.map(([value, count]) => (
                <option key={value} value={value}>
                  {translateSource(value)} ({count})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>IP</span>
            <input
              className="admin-input"
              value={ipFilter}
              onChange={(event) => setIpFilter(event.target.value)}
              placeholder="82.167.28.249"
              dir="ltr"
            />
          </label>
          <label>
            <span>المسؤول</span>
            <select
              className="admin-input"
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
            >
              <option value="ALL">كل المسؤولين</option>
              <option value="_unassigned">بدون مسؤول</option>
              {staff.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>من تاريخ</span>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="admin-input"
            />
          </label>
          <label>
            <span>إلى تاريخ</span>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="admin-input"
            />
          </label>
          <label>
            <span>الوسم</span>
            <select
              className="admin-input"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
            >
              <option value="ALL">كل الوسوم</option>
              {allTags.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="admin-crm-quickbar">
          {(
            [
              { id: "today", label: "اليوم" },
              { id: "7d", label: "آخر 7 أيام" },
              { id: "30d", label: "آخر 30 يوم" },
              { id: "90d", label: "آخر 90 يوم" },
              { id: "all", label: "كل الفترات" },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              className={range === option.id ? "is-active" : ""}
              onClick={() => {
                setRange(option.id);
                if (option.id === "today") {
                  const today = todayInputValue();
                  setFromDate(today);
                  setToDate(today);
                } else {
                  setFromDate("");
                  setToDate("");
                }
              }}
            >
              {option.label}
            </button>
          ))}
          <button type="button" onClick={() => setShowAdvanced((value) => !value)}>
            {showAdvanced ? "إخفاء الفلاتر المتقدمة" : "الفلاتر المتقدمة"}
          </button>
          <button type="button" onClick={resetFilters}>
            مسح الفلاتر
          </button>
        </div>

        {showAdvanced ? (
          <>
            <div className="admin-crm-advanced-grid">
              {advancedOptions.map((option) => (
                <label key={option.key}>
                  <input
                    type="checkbox"
                    checked={advanced[option.key]}
                    onChange={(event) =>
                      setAdvanced((current) => ({
                        ...current,
                        [option.key]: event.target.checked,
                      }))
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <div className="admin-crm-security-card">
              <div>
                <span className="admin-field-label">حماية IP</span>
                <strong>{activeBlockedIps.length} عنوان محظور</strong>
                <p>
                  الحظر يمنع العنوان من إرسال طلبات جديدة من الفورمات والويب هوكس.
                </p>
              </div>
              <div className="admin-crm-security-card__list">
                {activeBlockedIps.length ? (
                  activeBlockedIps.slice(0, 8).map((item) => (
                    <span key={item.id} className="admin-crm-ip-pill">
                      <button
                        type="button"
                        title="فلترة هذا الـ IP"
                        onClick={() => setIpFilter(item.ipAddress)}
                        dir="ltr"
                      >
                        {item.ipAddress}
                      </button>
                      {canDelete ? (
                        <button
                          type="button"
                          disabled={isIpBlockPending}
                          onClick={() => void unblockIp(item)}
                        >
                          فك الحظر
                        </button>
                      ) : null}
                    </span>
                  ))
                ) : (
                  <span className="admin-crm-security-card__empty">
                    لا توجد عناوين محظورة حاليًا.
                  </span>
                )}
              </div>
            </div>
          </>
        ) : null}
      </section>

      <section className="admin-crm-database-stats">
        <button type="button" onClick={() => setRange("today")}>
          <span>وارد اليوم</span>
          <strong>{dailyCount}</strong>
        </button>
        <button type="button" onClick={() => setOwner("_unassigned")}>
          <span>بدون مسؤول</span>
          <strong>{unassignedCount}</strong>
        </button>
        <button
          type="button"
          onClick={() =>
            setAdvanced((current) => ({ ...current, webhookOnly: true }))
          }
        >
          <span>من حملات / Webhooks</span>
          <strong>{campaignCount}</strong>
        </button>
        <button type="button" onClick={() => setStatus(SubmissionStatus.BOOKED)}>
          <span>تحولت لحجز</span>
          <strong>{bookedCount}</strong>
        </button>
      </section>

      <section className="admin-crm-pipeline" aria-label="مراحل الليدز">
        {pipeline.map((column) => (
          <button
            key={column.stage}
            type="button"
            className={`admin-crm-pipeline__column ${
              status === column.stage ? "is-active" : ""
            }`}
            onClick={() => setStatus(column.stage)}
          >
            <header>
              <div>
                <strong>{STATUS_AR[column.stage]}</strong>
                <span>مرحلة في خط المتابعة</span>
              </div>
              <em>{column.total}</em>
            </header>
          </button>
        ))}
      </section>

      {canDelete && selectedCount ? (
        <section className="admin-crm-bulk-bar" aria-live="polite">
          <strong>تم تحديد {selectedCount} طلب</strong>
          <div className="admin-crm-bulk-controls">
            <label>
              <span>الحالة</span>
              <select
                className="admin-input"
                value={bulkStatus}
                disabled={isBulkPending}
                onChange={(event) => setBulkStatus(event.target.value as SubmissionStatus)}
              >
                {STATUS_ORDER.map((value) => (
                  <option key={value} value={value}>
                    {STATUS_AR[value]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={isBulkPending}
                onClick={() => submitBulkAction("status")}
              >
                تغيير الحالة
              </button>
            </label>
            <label>
              <span>المسؤول</span>
              <select
                className="admin-input"
                value={bulkAssignee}
                disabled={isBulkPending}
                onChange={(event) => setBulkAssignee(event.target.value)}
              >
                <option value="">بدون مسؤول</option>
                {staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={isBulkPending}
                onClick={() => submitBulkAction("assign")}
              >
                تعيين
              </button>
            </label>
            <label>
              <span>المصدر</span>
              <input
                className="admin-input"
                value={bulkSource}
                disabled={isBulkPending}
                onChange={(event) => setBulkSource(event.target.value)}
                placeholder="مثال: Facebook Lead Form - Laser"
              />
              <button
                type="button"
                disabled={isBulkPending || !bulkSource.trim()}
                onClick={() => submitBulkAction("source")}
              >
                تغيير المصدر
              </button>
            </label>
            <a className="admin-btn-secondary" href={buildExportUrl(selectedIds)}>
              تصدير Excel
            </a>
            <button
              type="button"
              className="admin-btn-secondary"
              disabled={isBulkPending}
              onClick={() => setConfirmAction("archive")}
            >
              أرشفة
            </button>
            {canDelete ? (
              <button
                type="button"
                className="admin-btn-danger"
                disabled={isBulkPending}
                onClick={() => setConfirmAction("delete")}
              >
                حذف
              </button>
            ) : null}
            <button
              type="button"
              className="admin-btn-secondary"
              disabled={isBulkPending}
              onClick={() => setSelectedIds([])}
            >
              إلغاء التحديد
            </button>
          </div>
        </section>
      ) : null}

      <section className="admin-crm-leads-list">
        {visibleLeads.length === 0 ? (
          <div className="admin-crm-empty">
            <strong>لا توجد نتائج مطابقة</strong>
            <p>جرّب توسيع الفترة أو مسح بعض الفلاتر.</p>
            <button type="button" className="admin-btn-secondary" onClick={resetFilters}>
              مسح كل الفلاتر
            </button>
          </div>
        ) : (
          <div className="admin-crm-sheet">
            <div className="admin-crm-sheet__toolbar">
              <div>
                <span className="admin-field-label">قائمة الطلبات</span>
                <strong>{visibleLeads.length} سجل</strong>
              </div>
              <span>افتح الطلب لمتابعة التفاصيل أو استخدم التحديد للإجراءات الجماعية.</span>
            </div>
            <div className="admin-crm-sheet__scroll">
              <table className="table-hover table align-middle">
                <thead>
                  <tr>
                    {canDelete ? (
                      <th className="admin-crm-check-cell">
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          aria-label="تحديد كل الطلبات الظاهرة"
                          onChange={toggleAllVisible}
                        />
                      </th>
                    ) : null}
                    <th>العميل</th>
                    <th>الجوال</th>
                    <th>
                      <SortButton
                        label="الحالة"
                        sortKey="status"
                        currentKey={sortKey}
                        direction={sortDirection}
                        onSort={toggleSort}
                      />
                    </th>
                    <th>
                      <SortButton
                        label="المصدر"
                        sortKey="source"
                        currentKey={sortKey}
                        direction={sortDirection}
                        onSort={toggleSort}
                      />
                    </th>
                    <th>
                      <SortButton
                        label="المسؤول"
                        sortKey="owner"
                        currentKey={sortKey}
                        direction={sortDirection}
                        onSort={toggleSort}
                      />
                    </th>
                    <th>
                      <SortButton
                        label="آخر تفاعل"
                        sortKey="lastInteraction"
                        currentKey={sortKey}
                        direction={sortDirection}
                        onSort={toggleSort}
                      />
                    </th>
                    <th>
                      <SortButton
                        label="تاريخ الدخول"
                        sortKey="createdAt"
                        currentKey={sortKey}
                        direction={sortDirection}
                        onSort={toggleSort}
                      />
                    </th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleLeads.map((submission) => {
                    const rowSelected = selectedSet.has(submission.id);
                    const lastInteraction = getLastInteractionIso(submission);
                    return (
                      <tr
                        key={submission.id}
                        id={`lead-${submission.id}`}
                        data-selected={rowSelected ? "true" : "false"}
                        tabIndex={0}
                        onClick={() => setSelectedLeadId(submission.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedLeadId(submission.id);
                          }
                        }}
                      >
                        {canDelete ? (
                          <td
                            className="admin-crm-check-cell"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={rowSelected}
                              aria-label={`تحديد طلب ${submission.fullName}`}
                              onChange={() => toggleSelected(submission.id)}
                            />
                          </td>
                        ) : null}
                        <td>
                          <button
                            type="button"
                            className="admin-crm-sheet__lead-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedLeadId(submission.id);
                            }}
                          >
                            <strong title={submission.fullName}>
                              {submission.fullName}
                            </strong>
                            <span>{submission.serviceLabel ?? "بدون خدمة"}</span>
                          </button>
                        </td>
                        <td dir="ltr">
                          <div className="admin-crm-phone-cell">
                            <span>{submission.phone}</span>
                            <button
                              type="button"
                              title="نسخ الرقم"
                              onClick={(event) => {
                                event.stopPropagation();
                                void copyPhone(submission.phone);
                              }}
                            >
                              نسخ
                            </button>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`admin-status-badge ${STATUS_BADGE[submission.status]}`}
                          >
                            {STATUS_AR[submission.status]}
                          </span>
                        </td>
                        <td>
                          <span
                            className="admin-source-badge"
                            title={leadSourceTitle(submission)}
                          >
                            {leadSourceDisplay(submission)}
                          </span>
                        </td>
                        <td>
                          <span className="admin-assignee-badge">
                            {submission.assignedToName ?? "بدون مسؤول"}
                          </span>
                        </td>
                        <td>{formatTimeAgo(lastInteraction, nowSnapshot)}</td>
                        <td>{formatArabicDate(submission.createdAt)}</td>
                        <td onClick={(event) => event.stopPropagation()}>
                          <details className="admin-crm-row-actions">
                            <summary>إجراءات</summary>
                            <div>
                              <button
                                type="button"
                                onClick={() => setSelectedLeadId(submission.id)}
                              >
                                فتح
                              </button>
                              <a href={`tel:${submission.phone}`}>اتصال</a>
                              <a
                                href={whatsappHref(submission.phone)}
                                target="_blank"
                                rel="noreferrer"
                              >
                                واتساب
                              </a>
                              <form
                                onSubmit={(event) => {
                                  event.preventDefault();
                                  void updateLeadStatus(
                                    new FormData(event.currentTarget),
                                  );
                                }}
                              >
                                <input type="hidden" name="id" value={submission.id} />
                                <select
                                  name="status"
                                  defaultValue={submission.status}
                                  className="admin-input"
                                >
                                  {STATUS_ORDER.map((value) => (
                                    <option key={value} value={value}>
                                      {STATUS_AR[value]}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="submit"
                                  disabled={statusUpdateId === submission.id}
                                >
                                  {statusUpdateId === submission.id
                                    ? "جاري التحديث..."
                                    : "تحديث الحالة"}
                                </button>
                              </form>
                            </div>
                          </details>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="admin-crm-mobile-cards">
              {visibleLeads.map((submission) => {
                const rowSelected = selectedSet.has(submission.id);
                return (
                  <article key={submission.id} className="admin-crm-mobile-card">
                    {canDelete ? (
                      <label className="admin-crm-mobile-card__select">
                        <input
                          type="checkbox"
                          checked={rowSelected}
                          onChange={() => toggleSelected(submission.id)}
                        />
                        <span>تحديد</span>
                      </label>
                    ) : null}
                    <div>
                      <strong>{submission.fullName}</strong>
                      <span>{submission.serviceLabel ?? "بدون خدمة"}</span>
                    </div>
                    <div className="admin-crm-mobile-card__meta">
                      <span className={`admin-status-badge ${STATUS_BADGE[submission.status]}`}>
                        {STATUS_AR[submission.status]}
                      </span>
                      <span
                        className="admin-source-badge"
                        title={leadSourceTitle(submission)}
                      >
                        {leadSourceDisplay(submission)}
                      </span>
                    </div>
                    <div className="admin-crm-mobile-card__actions">
                      <button type="button" onClick={() => setSelectedLeadId(submission.id)}>
                        فتح
                      </button>
                      <button type="button" onClick={() => void copyPhone(submission.phone)}>
                        نسخ الرقم
                      </button>
                      <a href={whatsappHref(submission.phone)} target="_blank" rel="noreferrer">
                        واتساب
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {confirmAction ? (
        <div className="admin-modal admin-crm-confirm modal fade show" role="dialog" aria-modal="true">
          <button
            type="button"
            className="admin-modal__backdrop modal-backdrop fade show"
            aria-label="إغلاق التأكيد"
            onClick={() => setConfirmAction(null)}
          />
          <div className="admin-modal__panel modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <header className="admin-modal__header modal-header">
                <h2 className="admin-modal__title modal-title">
                  تأكيد الإجراء الجماعي
                </h2>
                <button
                  type="button"
                  className="admin-modal__close btn-close"
                  aria-label="إغلاق"
                  onClick={() => setConfirmAction(null)}
                >
                  ×
                </button>
              </header>
              <div className="admin-modal__body modal-body">
                <p>
                  هل أنت متأكد من تطبيق هذا الإجراء على {selectedCount} طلب؟
                </p>
                <div className="admin-crm-confirm__actions">
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    disabled={isBulkPending}
                    onClick={() => setConfirmAction(null)}
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    className={
                      confirmAction === "delete" ? "admin-btn-danger" : "admin-btn-primary"
                    }
                    disabled={isBulkPending}
                    onClick={() => submitBulkAction(confirmAction)}
                  >
                    {isBulkPending
                      ? "جاري التنفيذ..."
                      : confirmAction === "delete"
                        ? "حذف المحدد"
                        : "أرشفة المحدد"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deleteCandidate ? (
        <div
          className="admin-modal admin-crm-confirm admin-crm-delete-confirm modal fade show"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-lead-title-${deleteCandidate.id}`}
        >
          <button
            type="button"
            className="admin-modal__backdrop modal-backdrop fade show"
            aria-label="إغلاق تأكيد الحذف"
            onClick={() => setDeleteCandidate(null)}
          />
          <div className="admin-modal__panel modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <header className="admin-modal__header modal-header">
                <h2
                  id={`delete-lead-title-${deleteCandidate.id}`}
                  className="admin-modal__title modal-title"
                >
                  تأكيد حذف الطلب
                </h2>
                <button
                  type="button"
                  className="admin-modal__close btn-close"
                  aria-label="إغلاق"
                  onClick={() => setDeleteCandidate(null)}
                >
                  ×
                </button>
              </header>
              <div className="admin-modal__body modal-body">
                <p>
                  هل أنت متأكد من حذف طلب{" "}
                  <strong>{deleteCandidate.fullName}</strong> نهائيًا؟ سيتم حذف
                  سجل المتابعة المرتبط به أيضًا.
                </p>
                <div className="admin-crm-confirm__actions">
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    disabled={isDeletePending}
                    onClick={() => setDeleteCandidate(null)}
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    className="admin-btn-danger"
                    disabled={isDeletePending}
                    onClick={() => void deleteLead(deleteCandidate)}
                  >
                    {isDeletePending ? "جاري الحذف..." : "حذف نهائي"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {ipBlockCandidate ? (
        <div
          className="admin-modal admin-crm-confirm admin-crm-ip-block-confirm modal fade show"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`block-ip-title-${ipBlockCandidate.id}`}
        >
          <button
            type="button"
            className="admin-modal__backdrop modal-backdrop fade show"
            aria-label="إغلاق تأكيد حظر IP"
            onClick={() => setIpBlockCandidate(null)}
          />
          <div className="admin-modal__panel modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              <header className="admin-modal__header modal-header">
                <h2
                  id={`block-ip-title-${ipBlockCandidate.id}`}
                  className="admin-modal__title modal-title"
                >
                  تأكيد حظر IP
                </h2>
                <button
                  type="button"
                  className="admin-modal__close btn-close"
                  aria-label="إغلاق"
                  onClick={() => setIpBlockCandidate(null)}
                >
                  ×
                </button>
              </header>
              <div className="admin-modal__body modal-body">
                <p>
                  سيتم منع هذا العنوان من إرسال طلبات جديدة:
                  <strong dir="ltr">{ipBlockCandidate.ipAddress}</strong>
                </p>
                <label className="admin-crm-ip-block-reason">
                  <span>سبب الحظر</span>
                  <textarea
                    className="admin-input"
                    value={ipBlockReason}
                    onChange={(event) => setIpBlockReason(event.target.value)}
                    placeholder="مثال: استخدام رقم غير خاص به / تكرار مزعج"
                    rows={3}
                  />
                </label>
                <div className="admin-crm-confirm__actions">
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    disabled={isIpBlockPending}
                    onClick={() => setIpBlockCandidate(null)}
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    className="admin-btn-danger"
                    disabled={isIpBlockPending}
                    onClick={() => void blockSelectedIp()}
                  >
                    {isIpBlockPending ? "جاري الحظر..." : "حظر IP"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedSubmission ? (
        <div
          className="admin-modal admin-crm-modal modal fade show"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`lead-modal-title-${selectedSubmission.id}`}
        >
          <button
            type="button"
            className="admin-modal__backdrop modal-backdrop fade show"
            aria-label="إغلاق التفاصيل"
            onClick={() => setSelectedLeadId(null)}
          />
          <div className="admin-modal__panel modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <header className="admin-modal__header modal-header">
                <div className="admin-crm-lead-main">
                  <h2
                    id={`lead-modal-title-${selectedSubmission.id}`}
                    className="admin-modal__title modal-title"
                  >
                    {selectedSubmission.fullName}
                  </h2>
                  <span>
                    {selectedSubmission.phone}
                    {selectedSubmission.serviceLabel
                      ? ` · ${selectedSubmission.serviceLabel}`
                      : ""}
                  </span>
                </div>
                <div className="admin-crm-lead-meta">
                  <span
                    className={`admin-status-badge ${STATUS_BADGE[selectedSubmission.status]}`}
                  >
                    {STATUS_AR[selectedSubmission.status]}
                  </span>
                  <span
                    className="admin-chip"
                    title={leadSourceTitle(selectedSubmission)}
                  >
                    {leadSourceDisplay(selectedSubmission)}
                  </span>
                  {selectedSubmission.webhookName ? (
                    <span className="admin-chip is-accent">
                      Webhook: {selectedSubmission.webhookName}
                    </span>
                  ) : null}
                  <span className="admin-chip is-accent">
                    {formatTimeAgo(selectedSubmission.createdAt, nowSnapshot)}
                  </span>
                  <button
                    type="button"
                    className="admin-modal__close btn-close"
                    aria-label="إغلاق"
                    onClick={() => setSelectedLeadId(null)}
                  >
                    ×
                  </button>
                </div>
              </header>

              <div className="admin-modal__body modal-body">
                <div className="admin-crm-modal__summary">
                  <div>
                    <span className="admin-field-label">تاريخ الدخول</span>
                    <strong>{formatArabicDate(selectedSubmission.createdAt)}</strong>
                  </div>
                  <div>
                    <span className="admin-field-label">المسؤول</span>
                    <strong>
                      {selectedSubmission.assignedToName ?? "غير محدد"}
                    </strong>
                  </div>
                  <div>
                    <span className="admin-field-label">المصدر</span>
                    <strong>{leadSourceDisplay(selectedSubmission)}</strong>
                  </div>
                  <div>
                    <span className="admin-field-label">الحملة</span>
                    <strong>
                      {[
                        selectedSubmission.utmSource,
                        selectedSubmission.utmMedium,
                        selectedSubmission.utmCampaign,
                        selectedSubmission.utmContent,
                      ]
                        .filter(Boolean)
                        .join(" / ") || "لا يوجد"}
                    </strong>
                  </div>
                  <div>
                    <span className="admin-field-label">IP</span>
                    <strong dir="ltr">
                      {missingLeadMeta(selectedSubmission.ipAddress)}
                    </strong>
                    {selectedSubmission.ipAddress ? (
                      <div className="admin-crm-ip-actions">
                        <button
                          type="button"
                          className="admin-btn-secondary"
                          onClick={() => setIpFilter(selectedSubmission.ipAddress ?? "")}
                        >
                          فلترة IP
                        </button>
                        {canDelete ? (
                          isSelectedIpBlocked ? (
                            <span className="admin-chip is-warning">IP محظور</span>
                          ) : (
                            <button
                              type="button"
                              className="admin-btn-danger"
                              onClick={() => {
                                setIpBlockCandidate(selectedSubmission);
                                setIpBlockReason("");
                              }}
                            >
                              حظر IP
                            </button>
                          )
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <span className="admin-field-label">البلد</span>
                    <strong>{countryLabel(selectedSubmission.country)}</strong>
                  </div>
                  <div>
                    <span className="admin-field-label">صفحة الإرسال</span>
                    <p dir="ltr" title={selectedSubmission.landingPageUrl}>
                      {compactUrl(selectedSubmission.landingPageUrl)}
                    </p>
                  </div>
                  <div>
                    <span className="admin-field-label">جاي منين</span>
                    <p dir="ltr" title={selectedSubmission.referrerUrl}>
                      {selectedSubmission.utmSource
                        ? `utm_source=${selectedSubmission.utmSource}`
                        : compactUrl(selectedSubmission.referrerUrl)}
                    </p>
                  </div>
                  <div>
                    <span className="admin-field-label">المتصفح</span>
                    <p title={selectedSubmission.userAgent}>
                      {parseUserAgent(selectedSubmission.userAgent).label}
                    </p>
                    {selectedSubmission.userAgent ? (
                      <details className="admin-crm-ua-details">
                        <summary>عرض User-Agent الخام</summary>
                        <code dir="ltr">{selectedSubmission.userAgent}</code>
                      </details>
                    ) : null}
                  </div>
                  <div>
                    <span className="admin-field-label">رسالة العميل</span>
                    <p>{selectedSubmission.message || "لم يُرفق رسالة"}</p>
                  </div>
                </div>

                <div className="admin-crm-modal__actions">
                  <div className="admin-crm-modal__quick-actions">
                    <a
                      href={`tel:${selectedSubmission.phone}`}
                      className="admin-btn-secondary btn btn-outline-primary btn-sm"
                    >
                      اتصال
                    </a>
                    <a
                      href={whatsappHref(selectedSubmission.phone)}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn-secondary btn btn-outline-success btn-sm"
                    >
                      واتساب
                    </a>
                    <button
                      type="button"
                      className="admin-btn-secondary btn btn-outline-primary btn-sm"
                      onClick={() => void copyPhone(selectedSubmission.phone)}
                    >
                      نسخ الرقم
                    </button>
                  </div>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void updateLeadStatus(new FormData(event.currentTarget));
                    }}
                  >
                    <input type="hidden" name="id" value={selectedSubmission.id} />
                    <select
                      name="status"
                      className="admin-input form-select"
                      defaultValue={selectedSubmission.status}
                    >
                      {STATUS_ORDER.map((value) => (
                        <option key={value} value={value}>
                          {STATUS_AR[value]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="admin-btn-secondary btn btn-outline-primary btn-sm"
                      disabled={statusUpdateId === selectedSubmission.id}
                    >
                      {statusUpdateId === selectedSubmission.id
                        ? "جاري التحديث..."
                        : "تحديث الحالة"}
                    </button>
                  </form>
                  {canDelete ? (
                    <button
                      type="button"
                      className="admin-btn-danger btn btn-outline-danger btn-sm"
                      onClick={() => setDeleteCandidate(selectedSubmission)}
                    >
                      حذف الطلب
                    </button>
                  ) : null}
                </div>

                <div className="admin-crm-modal__pipeline">
                  {STATUS_ORDER.map((value) => (
                    <span
                      key={value}
                      className={
                        STATUS_ORDER.indexOf(value) <=
                        STATUS_ORDER.indexOf(selectedSubmission.status)
                          ? "is-active"
                          : ""
                      }
                    >
                      {STATUS_AR[value]}
                    </span>
                  ))}
                </div>

                <div className="admin-crm-modal__timeline">
                  <div className="admin-card__subtitle">سجل المتابعة</div>
                  <ol>
                    <li>
                      <strong>تم استقبال الليد</strong>
                      <span>{formatArabicDateTime(selectedSubmission.createdAt)}</span>
                    </li>
                    {selectedSubmission.comments.slice(0, 4).map((comment) => (
                      <li key={comment.id}>
                        <strong>{comment.authorName ?? "ملاحظة داخلية"}</strong>
                        <span>{formatArabicDateTime(comment.createdAt)}</span>
                        <p>{comment.body}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="admin-crm-modal__editor">
                  <CrmSubmissionEditor
                    key={selectedSubmission.id}
                    submission={selectedSubmission}
                    services={services}
                    staff={staff}
                    canDeleteComments={canDeleteComments}
                    {...(selectedSubmission.serviceId
                      ? { currentServiceSlug: selectedSubmission.serviceSlug }
                      : {})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
