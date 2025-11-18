import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Button,
  Heading,
  Img,
} from '@react-email/components';

export default function VerificationComplete({
  supplierName = 'there',
  businessName = 'Your Business',
  serviceType = 'entertainment',
  dashboardLink = 'https://partysnap.co.uk/suppliers/dashboard',
}) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Success Banner */}
          <Section style={styles.successBanner}>
            <Text style={styles.successIcon}>✓</Text>
            <Heading style={styles.bannerTitle}>Verification Complete!</Heading>
            <Text style={styles.bannerSubtitle}>{businessName} is now live on PartySnap</Text>
            <Text style={styles.verifiedBadge}>🛡️ Verified Supplier</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Text style={styles.greeting}>Hi {supplierName},</Text>

            <Text style={styles.paragraph}>
              Fantastic news! All your verification documents have been approved and <strong>{businessName}</strong> is now officially verified and live on the PartySnap platform.
            </Text>

            {/* What This Means */}
            <Section style={styles.benefitsBox}>
              <Heading as="h3" style={styles.benefitsHeading}>🎉 What This Means for You:</Heading>
              <Text style={styles.benefitItem}>• <strong>Higher search rankings:</strong> Verified suppliers appear first in results</Text>
              <Text style={styles.benefitItem}>• <strong>Trust badge:</strong> Customers see your verified status</Text>
              <Text style={styles.benefitItem}>• <strong>Premium features:</strong> Access to advanced booking tools</Text>
              <Text style={styles.benefitItem}>• <strong>More bookings:</strong> Verified suppliers get 3x more enquiries</Text>
            </Section>

            {/* Next Steps */}
            <Section style={styles.nextStepsBox}>
              <Heading as="h3" style={styles.nextStepsHeading}>Now Let's Get You Booked:</Heading>

              <Row style={styles.stepRow}>
                <Column style={styles.stepNumberColumn}>
                  <Text style={styles.stepNumber}>1</Text>
                </Column>
                <Column style={styles.stepTextColumn}>
                  <Heading as="h4" style={styles.stepTitle}>Complete Your Profile</Heading>
                  <Text style={styles.stepText}>
                    Add high-quality photos and detailed service descriptions. Complete profiles get 5x more views.
                  </Text>
                </Column>
              </Row>

              <Row style={styles.stepRow}>
                <Column style={styles.stepNumberColumn}>
                  <Text style={styles.stepNumber}>2</Text>
                </Column>
                <Column style={styles.stepTextColumn}>
                  <Heading as="h4" style={styles.stepTitle}>Set Your Availability</Heading>
                  <Text style={styles.stepText}>
                    Update your calendar so customers can see when you're free to book.
                  </Text>
                </Column>
              </Row>

              <Row style={styles.stepRow}>
                <Column style={styles.stepNumberColumn}>
                  <Text style={styles.stepNumber}>3</Text>
                </Column>
                <Column style={styles.stepTextColumn}>
                  <Heading as="h4" style={styles.stepTitle}>Create Service Packages</Heading>
                  <Text style={styles.stepText}>
                    Offer different packages at various price points to attract more customers.
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={dashboardLink} style={styles.ctaButton}>
                Access Your Dashboard
              </Button>
            </Section>

            {/* Stats Grid */}
            <Section style={styles.statsSection}>
              <Row style={styles.statsRow}>
                <Column style={styles.statColumn}>
                  <Text style={styles.statNumber}>3x</Text>
                  <Text style={styles.statLabel}>More Enquiries</Text>
                </Column>
                <Column style={styles.statColumn}>
                  <Text style={styles.statNumber}>85%</Text>
                  <Text style={styles.statLabel}>Book Within 7 Days</Text>
                </Column>
              </Row>
              <Row style={styles.statsRow}>
                <Column style={styles.statColumn}>
                  <Text style={styles.statNumber}>4.9★</Text>
                  <Text style={styles.statLabel}>Average Rating</Text>
                </Column>
                <Column style={styles.statColumn}>
                  <Text style={styles.statNumber}>24hr</Text>
                  <Text style={styles.statLabel}>Avg Response Time</Text>
                </Column>
              </Row>
            </Section>

            {/* Pro Tips */}
            <Section style={styles.tipsBox}>
              <Heading as="h3" style={styles.tipsHeading}>💡 Pro Tips to Get More Bookings:</Heading>
              <Text style={styles.tipItem}>• <strong>Respond quickly:</strong> Reply to enquiries within 1 hour for best results</Text>
              <Text style={styles.tipItem}>• <strong>Keep prices competitive:</strong> Check similar suppliers in your area</Text>
              <Text style={styles.tipItem}>• <strong>Show your personality:</strong> Parents love to know who they're booking</Text>
              <Text style={styles.tipItem}>• <strong>Ask for reviews:</strong> Great reviews lead to more bookings</Text>
            </Section>

            {/* Need Help */}
            <Section style={styles.helpSection}>
              <Heading as="h3" style={styles.helpHeading}>Need Help Getting Started?</Heading>
              <Text style={styles.helpText}>
                Our success team is here to help you get your first booking:
              </Text>
              <Text style={styles.contactDetail}><strong>Email:</strong> success@partysnap.uk</Text>
              <Text style={styles.contactDetail}><strong>Phone:</strong> 01234 567890</Text>
              <Text style={styles.contactDetail}><strong>Help Centre:</strong> help.partysnap.uk</Text>
            </Section>

            {/* Second CTA */}
            <Section style={styles.ctaSection}>
              <Button href={dashboardLink} style={styles.ctaButton}>
                Start Getting Bookings
              </Button>
              <Text style={styles.linkText}>Your verified supplier dashboard: {dashboardLink}</Text>
            </Section>

            <Text style={styles.closing}>
              Welcome to the PartySnap family!<br/>
              <strong>The PartySnap Team</strong><br/>
              Let's create magical moments together 🎉
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Img
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png"
              alt="PartySnap"
              style={styles.footerLogo}
            />
            <Text style={styles.footerText}>PartySnap Ltd, 123 Party Street, London, UK</Text>
            <Text style={styles.footerSmall}>
              You received this because your supplier verification was completed.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    margin: 0,
    padding: '20px',
    backgroundColor: '#f8f9fa',
    color: '#2F2F2F',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  successBanner: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    padding: '40px 30px',
    textAlign: 'center',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    fontSize: '40px',
    color: 'white',
  },
  bannerTitle: {
    margin: 0,
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white',
  },
  bannerSubtitle: {
    margin: '15px 0 0 0',
    fontSize: '18px',
    opacity: 0.9,
    color: 'white',
  },
  verifiedBadge: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    padding: '15px 25px',
    borderRadius: '25px',
    display: 'inline-block',
    fontWeight: 'bold',
    fontSize: '16px',
    margin: '20px 0 0 0',
  },
  content: {
    padding: '40px 30px',
    backgroundColor: '#FFFFFF',
    color: '#2F2F2F',
  },
  greeting: {
    color: '#374151',
    fontSize: '18px',
    lineHeight: '1.6',
    marginBottom: '25px',
  },
  paragraph: {
    color: '#374151',
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '25px',
  },
  benefitsBox: {
    backgroundColor: '#dcfce7',
    borderRadius: '12px',
    padding: '25px',
    margin: '25px 0',
    border: '2px solid #10b981',
  },
  benefitsHeading: {
    color: '#065f46',
    margin: '0 0 15px 0',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  benefitItem: {
    color: '#064e3b',
    margin: '8px 0',
    fontSize: '15px',
    lineHeight: '1.8',
  },
  nextStepsBox: {
    background: '#f0f9ff',
    border: '2px solid #0284c7',
    borderRadius: '12px',
    padding: '25px',
    margin: '25px 0',
  },
  nextStepsHeading: {
    color: '#0369a1',
    margin: '0 0 20px 0',
    fontSize: '22px',
    fontWeight: 'bold',
  },
  stepRow: {
    marginBottom: '20px',
  },
  stepNumberColumn: {
    width: '40px',
    verticalAlign: 'top',
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    background: '#FC6B57',
    color: 'white',
    borderRadius: '50%',
    fontWeight: 'bold',
    fontSize: '14px',
    textAlign: 'center',
    lineHeight: '32px',
    margin: 0,
  },
  stepTextColumn: {
    paddingLeft: '15px',
    verticalAlign: 'top',
  },
  stepTitle: {
    color: '#374151',
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  stepText: {
    color: '#6b7280',
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.5',
  },
  ctaSection: {
    textAlign: 'center',
    margin: '35px 0',
  },
  ctaButton: {
    backgroundColor: '#FC6B57',
    color: 'white',
    padding: '18px 36px',
    borderRadius: '25px',
    fontWeight: 'bold',
    fontSize: '18px',
    textDecoration: 'none',
    display: 'inline-block',
    border: '2px solid #FC6B57',
  },
  linkText: {
    margin: '15px 0 0 0',
    color: '#6b7280',
    fontSize: '12px',
  },
  statsSection: {
    backgroundColor: '#f9fafb',
    padding: '25px',
    borderRadius: '12px',
    margin: '25px 0',
  },
  statsRow: {
    marginBottom: '20px',
  },
  statColumn: {
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#FC6B57',
    marginBottom: '5px',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '600',
  },
  tipsBox: {
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    padding: '25px',
    margin: '25px 0',
    border: '2px solid #f59e0b',
  },
  tipsHeading: {
    color: '#92400e',
    margin: '0 0 15px 0',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  tipItem: {
    color: '#78350f',
    margin: '8px 0',
    fontSize: '14px',
    lineHeight: '1.8',
  },
  helpSection: {
    borderTop: '2px solid #f3f4f6',
    paddingTop: '30px',
    marginTop: '40px',
  },
  helpHeading: {
    color: '#374151',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  helpText: {
    color: '#6b7280',
    fontSize: '15px',
    lineHeight: '1.6',
    marginBottom: '15px',
  },
  contactDetail: {
    color: '#4b5563',
    fontSize: '14px',
    margin: '5px 0',
  },
  closing: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#707070',
    marginTop: '40px',
    fontSize: '16px',
  },
  footer: {
    backgroundColor: '#2F2F2F',
    color: '#FFFFFF',
    padding: '25px',
    textAlign: 'center',
  },
  footerLogo: {
    maxWidth: '100px',
    height: 'auto',
    margin: '0 auto 15px',
    opacity: 0.9,
  },
  footerText: {
    margin: '10px 0',
    color: '#FFFFFF',
    fontSize: '13px',
  },
  footerSmall: {
    fontSize: '11px',
    opacity: 0.8,
    margin: '5px 0',
    color: '#FFFFFF',
  },
};
