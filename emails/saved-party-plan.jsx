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
  totalCost
}) {
  // Capitalize first letter of child's name
  const formattedChildName = childName
    ? childName.charAt(0).toUpperCase() + childName.slice(1)
    : 'Your child';

  // Format theme for display
  const formattedTheme = theme
    ? theme.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
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

            {/* Party Details */}
            {(formattedTheme || formattedDate || totalCost > 0) && (
              <>
                <Text style={styles.detailRow}>
                  {formattedTheme && <><strong>Theme:</strong> {formattedTheme}<br /></>}
                  {formattedDate && <><strong>Date:</strong> {formattedDate}<br /></>}
                  {totalCost > 0 && <><strong>Estimated total:</strong> £{totalCost.toLocaleString()}</>}
                </Text>
              </>
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
