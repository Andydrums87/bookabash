import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Img,
  Hr,
} from '@react-email/components';

export default function SavedPartyPlanEmail({
  childName = 'your child',
  theme,
  partyDate,
  totalCost,
  suppliers = [], // Array of { category, name, price }
  guestCount,
  discountCode = null, // SAVE20-XXXXX format
  discountAmount = 20
}) {
  // Capitalize first letter of child's name
  const formattedChildName = childName
    ? childName.charAt(0).toUpperCase() + childName.slice(1)
    : 'Your child';

  // Format theme for display
  const formattedTheme = theme
    ? (() => {
        // Handle compound performance party themes like 'dance-party:princess'
        const parts = theme.split(':');
        const activityTypes = { 'drama-party': 'Drama Party', 'dance-party': 'Dance Party', 'music-party': 'Music Party' };
        if (parts.length === 2 && activityTypes[parts[0]]) {
          const subLabel = parts[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          return `${subLabel} ${activityTypes[parts[0]]}`;
        }
        if (activityTypes[theme]) return activityTypes[theme];
        return theme.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      })()
    : null;

  // Format date for display
  const formattedDate = partyDate
    ? new Date(partyDate).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null;

  // Format category name for display
  const formatCategory = (category) => {
    const categoryNames = {
      venue: 'Venue',
      entertainment: 'Entertainment',
      cakes: 'Cake',
      facePainting: 'Face Painting',
      activities: 'Activities',
      partyBags: 'Party Bags',
      decorations: 'Decorations',
      catering: 'Catering',
      balloons: 'Balloons',
      photography: 'Photography',
      bouncyCastle: 'Bouncy Castle'
    };
    return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Img
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1752578794/Transparent_With_Text_1_nfb1pi.png"
              alt="PartySnap"
              width={150}
              style={styles.logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Heading style={styles.title}>
              {formattedChildName}'s party plan is saved!
            </Heading>

            <Text style={styles.text}>
              Great news! We've saved your party plan so you can come back anytime to complete your booking.
            </Text>

            {/* Discount Code Box */}
            {discountCode && (
              <Section style={styles.discountBox}>
                <Text style={styles.discountTitle}>🎁 Your exclusive discount</Text>
                <Text style={styles.discountCode}>{discountCode}</Text>
                <Text style={styles.discountDescription}>
                  Use this code at checkout to get £{discountAmount} off your booking
                </Text>
              </Section>
            )}

            {/* Party Details */}
            {(formattedTheme || formattedDate || guestCount) && (
              <Section style={styles.partyDetailsBox}>
                <Text style={styles.partyDetailsTitle}>Party Details</Text>
                {formattedTheme && (
                  <Text style={styles.partyDetailItem}>
                    <strong>Theme:</strong> {formattedTheme}
                  </Text>
                )}
                {formattedDate && (
                  <Text style={styles.partyDetailItem}>
                    <strong>Date:</strong> {formattedDate}
                  </Text>
                )}
                {guestCount && (
                  <Text style={styles.partyDetailItem}>
                    <strong>Guests:</strong> {guestCount} children
                  </Text>
                )}
              </Section>
            )}

            {/* Supplier Breakdown */}
            {suppliers && suppliers.length > 0 && (
              <Section style={styles.supplierSection}>
                <Text style={styles.supplierSectionTitle}>Your Party Plan</Text>
                {suppliers.map((supplier, index) => (
                  <Section key={index} style={styles.supplierRow}>
                    <Text style={styles.supplierCategory}>{formatCategory(supplier.category)}</Text>
                    <Text style={styles.supplierName}>{supplier.name}</Text>
                    <Text style={styles.supplierPrice}>£{supplier.price}</Text>
                  </Section>
                ))}
                <Hr style={styles.supplierDivider} />
                <Section style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Estimated Total</Text>
                  <Text style={styles.totalPrice}>£{totalCost?.toLocaleString() || 0}</Text>
                </Section>
              </Section>
            )}

            {/* CTA Button */}
            <Button
              href="https://partysnap.co.uk/dashboard"
              style={styles.button}
            >
              Continue Planning
            </Button>

            <Hr style={styles.divider} />

            {/* Your plan, your way */}
            <Text style={styles.sectionTitle}>
              Your plan, your way
            </Text>
            <Text style={styles.text}>
              This is just a starting point. You can add, edit, or remove any suppliers you want.
              Nothing is final until you're ready to book. Keep only what you need and skip the rest.
            </Text>

            <Hr style={styles.divider} />

            {/* What's included */}
            <Text style={styles.sectionTitle}>
              What you get with PartySnap
            </Text>
            <Text style={styles.text}>
              <strong>One booking, everything handled.</strong> We coordinate all your suppliers so you don't have to chase anyone.
            </Text>
            <Text style={styles.text}>
              <strong>Digital invites & RSVPs.</strong> Send beautiful e-invites, track who's coming, and manage your guest list all in one place.
            </Text>
            <Text style={styles.text}>
              <strong>Add extras anytime.</strong> Want to add party bags, a photographer, or decorations later? You can add anything after you've paid.
            </Text>

            <Hr style={styles.divider} />

            {/* Trust points */}
            <Text style={styles.sectionTitle}>
              Book with confidence
            </Text>
            <Text style={styles.trustPoint}>
              ✓ Personally coordinated with each supplier
            </Text>
            <Text style={styles.trustPoint}>
              ✓ Vetted and trusted local suppliers - only the best
            </Text>
            <Text style={styles.trustPoint}>
              ✓ Bookings confirmed within 2 days
            </Text>
            <Text style={styles.trustPoint}>
              ✓ Full money-back guarantee
            </Text>

            <Hr style={styles.divider} />

            {/* Urgency */}
            {formattedDate && (
              <Text style={styles.subtleText}>
                Popular suppliers book up quickly, especially for weekend dates.
                Secure yours before they're gone.
              </Text>
            )}

            {/* Second CTA */}
            <Button
              href="https://partysnap.co.uk/dashboard"
              style={styles.button}
            >
              Continue Planning
            </Button>

            <Hr style={styles.divider} />

            {/* Help Section - More Prominent */}
            <Section style={styles.helpSection}>
              <Text style={styles.helpTitle}>
                Need help? We're here for you
              </Text>
              <Text style={styles.helpText}>
                Have questions about your party plan? Want to discuss your options? Our team is ready to help.
              </Text>
              <Text style={styles.helpContact}>
                Just reply to this email or contact us at <strong>hello@partysnap.co.uk</strong>
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              We're here to help make {formattedChildName}'s party amazing.
            </Text>
            <Text style={styles.footerTextSmall}>
              © {new Date().getFullYear()} PartySnap. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: '20px',
    backgroundColor: '#f6f9fc',
    color: '#1a1a1a',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
  },
  header: {
    padding: '30px',
    textAlign: 'center',
    backgroundColor: '#2F2F2F',
  },
  logo: {
    margin: '0 auto',
  },
  content: {
    padding: '40px 30px',
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '26px',
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  text: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.6',
  },
  detailRow: {
    margin: '0 0 24px 0',
    fontSize: '16px',
    color: '#374151',
    lineHeight: '1.8',
    textAlign: 'center',
  },
  partyDetailsBox: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
  },
  discountBox: {
    backgroundColor: '#ecfdf5',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    textAlign: 'center',
    border: '2px dashed #10b981',
  },
  discountTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#059669',
  },
  discountCode: {
    margin: '0 0 12px 0',
    fontSize: '28px',
    fontWeight: '700',
    color: '#047857',
    letterSpacing: '2px',
    fontFamily: 'monospace',
  },
  discountDescription: {
    margin: '0',
    fontSize: '14px',
    color: '#065f46',
  },
  partyDetailsTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  partyDetailItem: {
    margin: '0 0 6px 0',
    fontSize: '15px',
    color: '#4b5563',
  },
  supplierSection: {
    backgroundColor: '#FFF7F5',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
  },
  supplierSectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  supplierRow: {
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #fee2e2',
  },
  supplierCategory: {
    margin: '0 0 4px 0',
    fontSize: '12px',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  supplierName: {
    margin: '0',
    fontSize: '15px',
    fontWeight: '500',
    color: '#1a1a1a',
  },
  supplierPrice: {
    margin: '4px 0 0 0',
    fontSize: '15px',
    fontWeight: '600',
    color: '#FF7247',
  },
  supplierDivider: {
    borderColor: '#FF7247',
    borderWidth: '2px',
    margin: '16px 0',
  },
  totalRow: {
    textAlign: 'center',
  },
  totalLabel: {
    margin: '0',
    fontSize: '14px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  totalPrice: {
    margin: '4px 0 0 0',
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  trustPoint: {
    margin: '0 0 8px 0',
    fontSize: '15px',
    color: '#374151',
    lineHeight: '1.5',
  },
  button: {
    display: 'block',
    backgroundColor: '#FF7247',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center',
    padding: '14px 32px',
    borderRadius: '50px',
    margin: '24px auto',
  },
  divider: {
    borderColor: '#e5e7eb',
    borderWidth: '1px',
    margin: '24px 0',
  },
  subtleText: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  helpSection: {
    textAlign: 'center',
    padding: '24px',
    backgroundColor: '#FFF7F5',
    borderRadius: '12px',
  },
  helpTitle: {
    margin: '0 0 12px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  helpText: {
    margin: '0 0 12px 0',
    fontSize: '15px',
    color: '#4b5563',
    lineHeight: '1.5',
  },
  helpContact: {
    margin: 0,
    fontSize: '15px',
    color: '#374151',
  },
  footer: {
    padding: '24px 30px',
    backgroundColor: '#2F2F2F',
    textAlign: 'center',
  },
  footerText: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#ffffff',
  },
  footerTextSmall: {
    margin: '8px 0 0 0',
    fontSize: '12px',
    color: '#9ca3af',
  },
};
