// lib/suppliers-api.js
import { cache } from "react";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

/* ------------------------------------------
   Helpers
------------------------------------------ */
async function getServerClient() {
  const cookieStore = await cookies();            // ✅ await the cookie store
  return createServerComponentClient({
    cookies: () => cookieStore,                   // ✅ pass a function returning the awaited store
  });
}

function toNumber(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

/* ------------------------------------------
   Core fetches (SSR/ISR safe)
------------------------------------------ */
export const getSuppliers = cache(async () => {
  try {
    const supabase = await getServerClient();

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
    const supabase = await getServerClient();

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

    if (!error && data) {
      return transformSupplierRecord(data);
    }

    // Fallback to mock
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
      updatedAt: new Date(), // replace with real timestamp if you have it
    }));
  } catch (e) {
    console.error("[SSR] Exception getAllSuppliersForSitemap:", e);
    return [];
  }
});

/* ------------------------------------------
   Transformer (aligned to your CSV / JSONB)
------------------------------------------ */
function transformSupplierRecord(record) {
  const d = record.data || {};

  const name =
    record.business_name ||
    d.businessName ||
    d.name ||
    record.json_name ||
    "Unnamed Supplier";

  const image =
    record.json_image ||
    record.json_cover ||
    d.coverPhoto ||
    d.image ||
    "/placeholder.jpg";

  return {
    id: record.id,
    slug: record.business_slug || record.id,
    name,
    description:
      record.json_desc || d.businessDescription || d.description || "Professional party supplier",
    category: record.json_category || d.category || "Entertainment",
    subcategory: d.subcategory || null,
    location: record.json_location || d.location || "London",
    priceFrom: toNumber(record.json_price_from ?? d.priceFrom ?? d.price) || 100,
    priceUnit: d.priceUnit || "per event",
    rating: toNumber(record.json_rating ?? d.rating) || 4.5,
    reviewCount: toNumber(d.reviewCount) || 0,
    themes: Array.isArray(d.themes) ? d.themes : [],
    image,
    coverPhoto: record.json_cover || d.coverPhoto || image,
    badges: Array.isArray(d.badges) ? d.badges : [],
    availability: d.availability || "Available",
    bookingCount: toNumber(d.bookingCount) || 0,
    packages: d.packages || [],
    portfolioImages: d.portfolioImages || [],
    portfolioVideos: d.portfolioVideos || [],
    owner: d.owner,
    verified: d.verified !== false,
    fastResponder: d.fastResponder !== false,
    responseTime: d.responseTime || "Within 24 hours",
    phone: d.phone || d?.owner?.phone || "",
    email: d.email || d?.owner?.email || "",
    activeSince: d.activeSince || ""
  };
}

/* ------------------------------------------
   Mock fallback (leave your existing one if different)
------------------------------------------ */
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
