import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font
} from '@react-pdf/renderer'

// Register fonts for a professional look
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.woff', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff', fontWeight: 700 },
  ]
})

// Color palette
const colors = {
  primary: '#F97316', // Orange - PartySnap brand color
  primaryDark: '#EA580C',
  secondary: '#1E293B',
  gray: '#64748B',
  lightGray: '#F1F5F9',
  border: '#E2E8F0',
  success: '#22C55E',
  white: '#FFFFFF',
  black: '#0F172A'
}

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
    color: colors.secondary,
    backgroundColor: colors.white
  },
  // Header section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary
  },
  logoSection: {
    flexDirection: 'column'
  },
  logoText: {
    fontSize: 28,
    fontWeight: 700,
    color: colors.primary,
    letterSpacing: -0.5
  },
  logoSubtext: {
    fontSize: 9,
    color: colors.gray,
    marginTop: 2
  },
  invoiceTitle: {
    textAlign: 'right'
  },
  invoiceLabel: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.secondary,
    marginBottom: 4
  },
  invoiceNumber: {
    fontSize: 11,
    color: colors.gray,
    marginBottom: 2
  },
  // Status badge
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-end'
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
    color: '#D97706'
  },
  statusApproved: {
    backgroundColor: '#DCFCE7',
    color: '#16A34A'
  },
  statusDeclined: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626'
  },
  statusText: {
    fontSize: 9,
    fontWeight: 600,
    textTransform: 'uppercase'
  },
  // Info sections
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  infoBlock: {
    width: '48%'
  },
  infoBlockTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  infoBlockContent: {
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 6
  },
  infoText: {
    fontSize: 10,
    color: colors.secondary,
    marginBottom: 3,
    lineHeight: 1.4
  },
  infoTextBold: {
    fontWeight: 600
  },
  // Service details section
  serviceSection: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.secondary,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  // Table
  table: {
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4
  },
  tableHeaderText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.3
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  tableRowAlt: {
    backgroundColor: colors.lightGray
  },
  tableCell: {
    fontSize: 10,
    color: colors.secondary
  },
  col1: { width: '50%' },
  col2: { width: '25%', textAlign: 'center' },
  col3: { width: '25%', textAlign: 'right' },
  // Totals section
  totalsSection: {
    marginTop: 10,
    paddingLeft: '50%'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  totalRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  totalLabel: {
    fontSize: 10,
    color: colors.gray
  },
  totalValue: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: 500
  },
  totalRowFinal: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    marginTop: 8
  },
  totalLabelFinal: {
    fontSize: 12,
    color: colors.white,
    fontWeight: 600
  },
  totalValueFinal: {
    fontSize: 14,
    color: colors.white,
    fontWeight: 700
  },
  // Booking details
  bookingDetails: {
    backgroundColor: colors.lightGray,
    padding: 16,
    borderRadius: 6,
    marginBottom: 30
  },
  bookingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  bookingItem: {
    width: '50%',
    marginBottom: 10
  },
  bookingLabel: {
    fontSize: 8,
    color: colors.gray,
    textTransform: 'uppercase',
    marginBottom: 2
  },
  bookingValue: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: 500
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40
  },
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 15,
    marginTop: 15
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 8,
    color: colors.gray
  },
  footerBrand: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: 600
  },
  // Notes
  notesSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: colors.primaryDark,
    marginBottom: 4
  },
  notesText: {
    fontSize: 9,
    color: colors.gray,
    lineHeight: 1.5
  },
  // Payout details
  payoutSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.lightGray,
    borderRadius: 6
  },
  payoutTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.secondary,
    marginBottom: 12
  },
  payoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  payoutItem: {
    width: '50%',
    marginBottom: 8
  },
  payoutLabel: {
    fontSize: 8,
    color: colors.gray,
    textTransform: 'uppercase',
    marginBottom: 2
  },
  payoutValue: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: 500
  }
})

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount || 0)
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Get status style
const getStatusStyle = (status) => {
  switch (status) {
    case 'approved':
      return styles.statusApproved
    case 'declined':
      return styles.statusDeclined
    default:
      return styles.statusPending
  }
}

// Format sort code with dashes
const formatSortCode = (sortCode) => {
  if (!sortCode) return 'N/A'
  return sortCode.replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3')
}

export default function InvoiceTemplate({ invoice }) {
  const bookingDetails = invoice.booking_details || {}
  const party = bookingDetails.party || {}
  const service = bookingDetails.service || {}
  const supplier = bookingDetails.supplier || {}
  const payoutDetails = invoice.payout_details || null

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Text style={styles.logoText}>PartySnap</Text>
            <Text style={styles.logoSubtext}>Party Planning Made Easy</Text>
          </View>
          <View style={styles.invoiceTitle}>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            <Text style={styles.invoiceNumber}>Date: {formatDate(invoice.invoice_date)}</Text>
            <View style={[styles.statusBadge, getStatusStyle(invoice.status)]}>
              <Text style={styles.statusText}>{invoice.status}</Text>
            </View>
          </View>
        </View>

        {/* Supplier & Service Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoBlockTitle}>Invoice To</Text>
            <View style={styles.infoBlockContent}>
              <Text style={[styles.infoText, styles.infoTextBold]}>
                {supplier.name || 'Supplier'}
              </Text>
              {payoutDetails?.business_address_line1 && (
                <Text style={styles.infoText}>
                  {payoutDetails.business_address_line1}
                </Text>
              )}
              {payoutDetails?.business_address_line2 && (
                <Text style={styles.infoText}>
                  {payoutDetails.business_address_line2}
                </Text>
              )}
              {(payoutDetails?.business_city || payoutDetails?.business_postcode) && (
                <Text style={styles.infoText}>
                  {[payoutDetails.business_city, payoutDetails.business_postcode].filter(Boolean).join(' ')}
                </Text>
              )}
              {payoutDetails?.vat_number && (
                <Text style={styles.infoText}>
                  VAT: {payoutDetails.vat_number}
                </Text>
              )}
              {payoutDetails?.company_reg_number && (
                <Text style={styles.infoText}>
                  Company No: {payoutDetails.company_reg_number}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoBlockTitle}>Service Details</Text>
            <View style={styles.infoBlockContent}>
              <Text style={[styles.infoText, styles.infoTextBold]}>
                Service Date: {formatDate(invoice.service_date)}
              </Text>
              <Text style={styles.infoText}>
                Child: {party.childName || 'N/A'}
              </Text>
              <Text style={styles.infoText}>
                Theme: {party.theme || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.serviceSection}>
          <Text style={styles.sectionTitle}>Booking Information</Text>
          <View style={styles.bookingDetails}>
            <View style={styles.bookingGrid}>
              <View style={styles.bookingItem}>
                <Text style={styles.bookingLabel}>Party Date</Text>
                <Text style={styles.bookingValue}>{formatDate(party.date)}</Text>
              </View>
              <View style={styles.bookingItem}>
                <Text style={styles.bookingLabel}>Party Time</Text>
                <Text style={styles.bookingValue}>{party.time || 'N/A'}</Text>
              </View>
              <View style={styles.bookingItem}>
                <Text style={styles.bookingLabel}>Guest Count</Text>
                <Text style={styles.bookingValue}>{party.guestCount || 'N/A'} guests</Text>
              </View>
              <View style={styles.bookingItem}>
                <Text style={styles.bookingLabel}>Location</Text>
                <Text style={styles.bookingValue}>{party.postcode || party.location || 'N/A'}</Text>
              </View>
              {party.deliveryAddress && (
                <View style={[styles.bookingItem, { width: '100%' }]}>
                  <Text style={styles.bookingLabel}>Delivery Address</Text>
                  <Text style={styles.bookingValue}>{party.deliveryAddress}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Charges Table */}
        <View style={styles.serviceSection}>
          <Text style={styles.sectionTitle}>Charges Breakdown</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.col1]}>Description</Text>
              <Text style={[styles.tableHeaderText, styles.col2]}>Qty</Text>
              <Text style={[styles.tableHeaderText, styles.col3]}>Amount</Text>
            </View>
            {/* Base service/product */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}>
                {service.packageName || service.category || 'Service'}{party.childName ? ` - ${party.childName}'s Party` : ''}
              </Text>
              <Text style={[styles.tableCell, styles.col2]}>1</Text>
              <Text style={[styles.tableCell, styles.col3]}>
                {formatCurrency(service.deliveryFee ? (invoice.gross_amount - service.deliveryFee) : invoice.gross_amount)}
              </Text>
            </View>
            {/* Delivery fee if applicable */}
            {service.deliveryFee > 0 && (
              <View style={[styles.tableRow, styles.tableRowAlt]}>
                <Text style={[styles.tableCell, styles.col1]}>
                  Delivery Fee{service.fulfilmentMethod ? ` (${service.fulfilmentMethod})` : ''}
                </Text>
                <Text style={[styles.tableCell, styles.col2]}>1</Text>
                <Text style={[styles.tableCell, styles.col3]}>{formatCurrency(service.deliveryFee)}</Text>
              </View>
            )}
          </View>

          {/* Totals */}
          <View style={styles.totalsSection}>
            <View style={[styles.totalRow, styles.totalRowBorder]}>
              <Text style={styles.totalLabel}>Gross Amount</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.gross_amount)}</Text>
            </View>
            <View style={[styles.totalRow, styles.totalRowBorder]}>
              <Text style={styles.totalLabel}>Platform Fee (15%)</Text>
              <Text style={styles.totalValue}>-{formatCurrency(invoice.platform_fee)}</Text>
            </View>
            <View style={[styles.totalRow, styles.totalRowFinal]}>
              <Text style={styles.totalLabelFinal}>Net Payout</Text>
              <Text style={styles.totalValueFinal}>{formatCurrency(invoice.net_amount)}</Text>
            </View>
          </View>
        </View>

        {/* Payout Details */}
        {payoutDetails && (
          <View style={styles.payoutSection}>
            <Text style={styles.payoutTitle}>Payout Details</Text>
            <View style={styles.payoutGrid}>
              {payoutDetails.bank_name && (
                <View style={styles.payoutItem}>
                  <Text style={styles.payoutLabel}>Bank</Text>
                  <Text style={styles.payoutValue}>{payoutDetails.bank_name}</Text>
                </View>
              )}
              <View style={styles.payoutItem}>
                <Text style={styles.payoutLabel}>Account Holder</Text>
                <Text style={styles.payoutValue}>{payoutDetails.account_holder_name}</Text>
              </View>
              <View style={styles.payoutItem}>
                <Text style={styles.payoutLabel}>Sort Code</Text>
                <Text style={styles.payoutValue}>{formatSortCode(payoutDetails.sort_code)}</Text>
              </View>
              <View style={styles.payoutItem}>
                <Text style={styles.payoutLabel}>Account Number</Text>
                <Text style={styles.payoutValue}>••••{payoutDetails.account_number?.slice(-4)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Important Information</Text>
          <Text style={styles.notesText}>
            {payoutDetails
              ? 'Please review this invoice and approve it to receive your payout to the account shown above. Payouts are typically processed within 5-7 business days after approval.'
              : 'Please add your bank details in Settings → Payout Details to receive payouts. Once added, your bank details will appear on future invoices.'}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider}>
            <View style={styles.footerContent}>
              <View>
                <Text style={styles.footerText}>PartySnap Ltd</Text>
                <Text style={styles.footerText}>hello@partysnap.co.uk | www.partysnap.co.uk</Text>
              </View>
              <View>
                <Text style={styles.footerBrand}>PartySnap</Text>
                <Text style={styles.footerText}>Invoice generated automatically</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
