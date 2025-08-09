export const revalidate = 3600; // keep ISR

import { notFound } from "next/navigation";
import {
  getSupplierById,
  getRelatedSuppliers,
  getPopularSuppliers,
} from "@/lib/suppliers-api";
import SupplierPageClient from "./supplier-page-client";

export default async function SupplierPage(props) {
  // ✅ await both
  const { id } = await props.params;
  const sp = await props.searchParams;
  const from =
    typeof sp?.get === "function" ? sp.get("from") : sp?.from || "direct";

  const supplier = await getSupplierById(id);
  if (!supplier) notFound();

  const relatedSuppliers = await getRelatedSuppliers(
    supplier.category,
    supplier.id
  );

  // JSON-LD (guard optional fields)
  const ld = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: supplier.name,
    description: supplier.description,
    image: supplier.image,
    url: `https://www.partysnap.co.uk/supplier/${supplier.slug || supplier.id}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: supplier.location,
      addressCountry: "GB",
    },
    serviceType: supplier.category,
    areaServed: supplier.location,
  };
  if (supplier.rating && supplier.reviewCount) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: supplier.rating,
      reviewCount: supplier.reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }
  if (supplier.priceFrom) {
    ld.offers = {
      "@type": "Offer",
      price: supplier.priceFrom,
      priceCurrency: "GBP",
      description: `Starting from £${supplier.priceFrom} ${supplier.priceUnit || ""}`.trim(),
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      {/* Minimal crawlable HTML (can keep sr-only if you want it hidden) */}
      <div className="sr-only">
        <h1>{supplier.name}</h1>
        <p>
          {supplier.category} · {supplier.location}
          {supplier.priceFrom ? ` · From £${supplier.priceFrom}` : ""}
        </p>
        <p>{supplier.description}</p>
      </div>

      <SupplierPageClient
        backendSupplier={supplier}
        relatedSuppliers={relatedSuppliers}
        navigationContext={from}
      />
    </>
  );
}

export async function generateMetadata({ params }) {
  const { id } = await params;           // ✅ await
  const supplier = await getSupplierById(id);
  if (!supplier) return { title: "Supplier Not Found | PartySnap" };

  const title = `${supplier.name} - ${supplier.category} | PartySnap`;
  const description = `${supplier.description} Located in ${supplier.location}${
    supplier.priceFrom ? `. From £${supplier.priceFrom}` : ""
  }${supplier.rating ? `. Rated ${supplier.rating}/5` : ""}.`;

  return {
    title,
    description,
    keywords: [
      supplier.name,
      supplier.category,
      supplier.location,
      ...(supplier.themes || []),
      "party supplier",
      "birthday party",
      supplier.subcategory,
    ]
      .filter(Boolean)
      .join(", "),
    openGraph: {
      title,
      description,
      images: [{ url: supplier.image, width: 800, height: 600, alt: supplier.name }],
      type: "website",
      siteName: "PartySnap",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [supplier.image],
    },
  };
}

export async function generateStaticParams() {
  try {
    const popular = await getPopularSuppliers(50);
    return popular.map((s) => ({ id: s.id }));
  } catch {
    return [];
  }
}
