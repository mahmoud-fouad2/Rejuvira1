import { readdir } from "node:fs/promises";
import path from "node:path";

export type ReferenceAsset = {
  fileName: string;
  label: string;
  path: string;
  category: string;
};

const assetMetadata: Record<
  string,
  Omit<ReferenceAsset, "fileName" | "path">
> = {
  "brand-logo.jpg": {
    label: "Local brand logo",
    category: "Brand",
  },
  "doctor-profile.svg": {
    label: "Doctor profile fallback",
    category: "Doctors",
  },
  "service-aesthetic-surgery.svg": {
    label: "Aesthetic surgery visual",
    category: "Services",
  },
  "service-skin-care.svg": {
    label: "Skin care visual",
    category: "Services",
  },
  "service-laser.svg": {
    label: "Laser technology visual",
    category: "Services",
  },
  "service-injectables.svg": {
    label: "Injectables visual",
    category: "Services",
  },
  "device-platform.svg": {
    label: "Medical device platform visual",
    category: "Devices",
  },
  "device-body.svg": {
    label: "Body care technology visual",
    category: "Devices",
  },
  "service-skin-rejuvenation.webp": {
    label: "Skin rejuvenation visual",
    category: "Services",
  },
  "service-prp.jpg": {
    label: "Non-surgical treatment visual",
    category: "Services",
  },
  "service-laser-hair-removal.jpg": {
    label: "Laser service visual",
    category: "Services",
  },
  "service-injectables.webp": {
    label: "Injectables visual",
    category: "Services",
  },
  "device-emface.jpg": {
    label: "Device hero visual",
    category: "Devices",
  },
  "device-laser-platform.webp": {
    label: "Laser platform visual",
    category: "Devices",
  },
  "loai-alsalmi.webp": {
    label: "د. لؤي السالمي",
    category: "Doctors",
  },
  "maher-alahdab.webp": {
    label: "د. ماهر الأحدب",
    category: "Doctors",
  },
  "saham-arfaj.webp": {
    label: "د. سهام العرفج",
    category: "Doctors",
  },
  "sabah-alrashid.webp": {
    label: "د. صباح الراشد",
    category: "Doctors",
  },
  "karima-jamjoom.webp": {
    label: "د. كريمة جمجوم",
    category: "Doctors",
  },
  "najwa-batarfi.webp": {
    label: "د. نجوى باطرفي",
    category: "Doctors",
  },
  "natali-domloj.webp": {
    label: "د. ناتالي دوملوج",
    category: "Doctors",
  },
  "falwah-aljanoubi.webp": {
    label: "د. فلوة الجنوبي",
    category: "Doctors",
  },
  "bandar-alharthi.webp": {
    label: "البروفيسور بندر الحارثي",
    category: "Doctors",
  },
  "ahmed-eldesouki.webp": {
    label: "د. أحمد الدسوقي",
    category: "Doctors",
  },
  "logo-I9e6URZ0.png": {
    label: "Rejuvera Center SPA logo",
    category: "Brand",
  },
  "dlogo.jpg": {
    label: "Legacy brand mark",
    category: "Brand",
  },
  "56549.webp": {
    label: "Doctor reference portrait",
    category: "Doctors",
  },
  "88985959.webp": {
    label: "Doctor reference portrait",
    category: "Doctors",
  },
  "WhatsApp-Image-2024-08-12-at-4.55.56-PM.jpeg": {
    label: "Clinic interior reference",
    category: "Clinic",
  },
  "WhatsApp-Image-2024-08-12-at-2.50.24-PM.jpeg": {
    label: "Clinic experience reference",
    category: "Clinic",
  },
  "9.png": {
    label: "Service visual reference",
    category: "Services",
  },
  "13.png": {
    label: "Service visual reference",
    category: "Services",
  },
  "15.png": {
    label: "Service visual reference",
    category: "Services",
  },
  "16.png": {
    label: "Service visual reference",
    category: "Services",
  },
  "18.png": {
    label: "Service/device visual reference",
    category: "Devices",
  },
  "88.png": {
    label: "Legacy website visual block",
    category: "Services",
  },
  "value.png": {
    label: "Legacy values section graphic",
    category: "Brand",
  },
};

function toFallbackLabel(fileName: string) {
  return fileName
    .replace(path.extname(fileName), "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getReferenceAssets(): Promise<ReferenceAsset[]> {
  const directories = [
    {
      fileSystemPath: path.join(
        process.cwd(),
        "public",
        "media",
        "reference",
        "legacy",
      ),
      publicPath: "/media/reference/legacy",
    },
    {
      fileSystemPath: path.join(process.cwd(), "public", "media", "curated"),
      publicPath: "/media/curated",
    },
    {
      fileSystemPath: path.join(process.cwd(), "public", "media", "doctors"),
      publicPath: "/media/doctors",
    },
  ];

  const fileGroups = await Promise.all(
    directories.map(async (directory) => {
      const files = await readdir(directory.fileSystemPath, {
        withFileTypes: true,
      }).catch(() => []);

      return files
        .filter((entry) => entry.isFile())
        .map((entry) => {
          const metadata = assetMetadata[entry.name];

          return {
            fileName: entry.name,
            label: metadata?.label ?? toFallbackLabel(entry.name),
            category: metadata?.category ?? "Reference",
            path: `${directory.publicPath}/${entry.name}`,
          };
        });
    }),
  );

  return fileGroups
    .flat()
    .sort((left, right) => left.fileName.localeCompare(right.fileName));
}
