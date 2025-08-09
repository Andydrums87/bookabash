// lib/suppliers-api.js
import { cache } from "react";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";

/* ---------- internal: pick the right client for the current context ---------- */
async function getSupabase() {
  // Try request-scoped cookies (RSC render, route handlers)
  try {
    const store = await cookies(); // throws if no request scope
    return createServerComponentClient({ cookies: () => store });
  } catch {
    // No request scope (build time, ISR revalidate, generateStaticParams/Metadata)
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );
  }
}

function toNumber(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

/* ------------------------------ core queries ------------------------------ */
export const getSuppliers = cache(async () => {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("suppliers")
      .select(`
        id,
        business_name,
        business_slug,
        business_type,
        is_active,
        created_at,
        data,
        json_name:data->>name,
        json_desc:data->>businessDescription,
        json_category:data->>category,
        json_location:data->>location,
        json_price_from:data->>priceFrom,
        json_image:data->>image,
        json_cover:data->>coverPhoto,
        json_rating:data->>rating
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("[SSR] DB error:", error);
      return getMockSuppliers();
    }

    const transformed = (data || [])
      .map(transformSupplierRecord)
      .filter((s) => s && s.id && s.name);

    return transformed.length ? transformed : getMockSuppliers();
  } catch (e) {
    console.error("[SSR] Exception:", e);
    return getMockSuppliers();
  }
});

export const getSupplierById = cache(async (id) => {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("suppliers")
      .select(`
        id,
        business_name,
        business_slug,
        business_type,
        is_active,
        created_at,
        data,
        json_name:data->>name,
        json_desc:data->>businessDescription,
        json_category:data->>category,
        json_location:data->>location,
        json_price_from:data->>priceFrom,
        json_image:data->>image,
        json_cover:data->>coverPhoto,
        json_rating:data->>rating
      `)
      .eq("id", id)
      .single();

    if (!error && data) return transformSupplierRecord(data);

    const mock = getMockSuppliers().find((s) => s.id === id);
    return mock || null;
  } catch (e) {
    console.error("[SSR] Exception getSupplierById:", e);
    return null;
  }
});

export const getRelatedSuppliers = cache(async (category, excludeId) => {
  try {
    const all = await getSuppliers();
    return all
      .filter(
        (s) =>
          s.category?.toLowerCase() === category?.toLowerCase() &&
          s.id !== excludeId
      )
      .slice(0, 4);
  } catch (e) {
    console.error("[SSR] Exception getRelatedSuppliers:", e);
    return [];
  }
});

export const getPopularSuppliers = cache(async (limit = 50) => {
  try {
    const all = await getSuppliers();
    return all
      .sort((a, b) => {
        const scoreA = (a.rating || 0) * Math.log((a.reviewCount || 0) + 1);
        const scoreB = (b.rating || 0) * Math.log((b.reviewCount || 0) + 1);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  } catch (e) {
    console.error("[SSR] Exception getPopularSuppliers:", e);
    return [];
  }
});

export const getSuppliersByCategory = cache(async (category) => {
  const all = await getSuppliers();
  if (!category || category === "all") return all;
  return all.filter(
    (s) => s.category?.toLowerCase() === category.toLowerCase()
  );
});

export const getAllSuppliersForSitemap = cache(async () => {
  try {
    const list = await getSuppliers();
    return list.map((s) => ({
      id: s.id,
      slug: s.slug || s.id,
      updatedAt: new Date(),
    }));
  } catch (e) {
    console.error("[SSR] Exception getAllSuppliersForSitemap:", e);
    return [];
  }
});

/* ------------------------------ transformer ------------------------------ */
// lib/suppliers-api.ts (or wherever transform lives)

function toNum(n, fallback = null) {
  if (n === null || n === undefined || n === "") return fallback;
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

export function transformSupplierRecord(row) {
  const d = row?.data ?? {};

  const id = row.id;
  const name = row.json_name ?? d.name ?? row.business_name ?? "Supplier";
  const slug = row.business_slug ?? d.slug ?? id;
  const category = row.json_category ?? d.category ?? row.business_type ?? "Entertainment";
  const location = row.json_location ?? d.location ?? "London";
  const description = row.json_desc ?? d.businessDescription ?? d.description ?? "";
  const image = row.json_image ?? d.image ?? "/placeholder.jpg";
  const coverPhoto = row.json_cover ?? d.coverPhoto ?? image;
  const priceFrom = toNum(row.json_price_from ?? d.priceFrom);
  const priceUnit = d.priceUnit ?? "per event";
  const rating = toNum(row.json_rating ?? d.rating);
  const reviewCount = toNum(d.reviewCount, 0);

  const packages = Array.isArray(d.packages) ? d.packages : [];
  const availability = d.availability ?? null;
  const unavailableDates = Array.isArray(d.unavailableDates) ? d.unavailableDates : [];
  const busyDates = Array.isArray(d.busyDates) ? d.busyDates : [];
  const availabilityNotes = d.availabilityNotes ?? null;
  const advanceBookingDays = toNum(d.advanceBookingDays);
  const maxBookingDays = toNum(d.maxBookingDays);

  const portfolioImages = Array.isArray(d.portfolioImages) ? d.portfolioImages : [];
  const portfolioVideos = Array.isArray(d.portfolioVideos) ? d.portfolioVideos : [];
  const badges = Array.isArray(d.badges) ? d.badges : [];

  const serviceDetails = (d.serviceDetails && typeof d.serviceDetails === "object") ? d.serviceDetails : {};
  const stats = (d.stats && typeof d.stats === "object") ? d.stats : undefined;

  return {
    id,
    slug,
    name,
    image,
    coverPhoto,
    description,
    category,
    subcategory: d.subcategory ?? undefined,
    location,
    priceFrom,
    priceUnit,
    rating,
    reviewCount,
    badges,

    availability,
    unavailableDates,
    busyDates,
    availabilityNotes,
    advanceBookingDays,
    maxBookingDays,

    packages,
    portfolioImages,
    portfolioVideos,

    serviceDetails,
    stats,
    verified: d.verified ?? true,
    fastResponder: d.fastResponder ?? true,
    responseTime: d.responseTime ?? "Within 24 hours",

    ownerName: d.ownerName,
    owner: d.owner,
  };
}



/* ------------------------------ mock fallback ------------------------------ */
function getMockSuppliers() {
  return [
    {
      id: "50a14c17-3411-42c4-87ae-4bb483d9bde9",
      slug: "magic-mikes-parties",
      name: "Magic Mike's Parties",
      description:
        "Professional magician specializing in children's birthday parties with amazing tricks and interactive shows",
      category: "Entertainment",
      subcategory: "Magicians",
      location: "Central London",
      priceFrom: 150,
      priceUnit: "per hour",
      rating: 4.8,
      reviewCount: 127,
      themes: ["princess", "superhero", "magic"],
      image:
        "https://res.cloudinary.com/dghzq6xtd/image/upload/v1753435484/zivotubsexikuudyl55r.jpg",
      availability: "Available",
      badges: ["Verified", "Top Rated"],
      bookingCount: 89,
      verified: true,
      fastResponder: true,
      responseTime: "Within 2 hours",
      phone: "+44 7123 456 789",
      email: "hello@magicmike.co.uk",
      activeSince: "2020",
    },
  ];
}
