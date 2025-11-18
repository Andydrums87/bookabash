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

export default function SupplierOnboarding({
  supplierName = 'there',
  businessName = 'Your Business',
  serviceType = 'entertainment',
  needsVerification = false,
  supplierEmail = '',
  dashboardLink = 'https://partysnap.uk/suppliers/dashboard',
}) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Welcome Banner */}
          <Section style={styles.welcomeBanner}>
            <Img
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png"
              alt="PartySnap Logo"
              style={styles.bannerLogo}
            />
            <Heading style={styles.bannerTitle}>Welcome to PartySnap Business!</Heading>
            <Text style={styles.bannerSubtitle}>{businessName} is now part of the UK's leading party platform</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Text style={styles.greeting}>Hi {supplierName},</Text>

            <Text style={styles.paragraph}>
              Congratulations! Your <strong>{businessName}</strong> account has been successfully created. You're now ready to start connecting with families looking for amazing <strong>{serviceType}</strong> services across the UK.
            </Text>

            {/* Verification Notice */}
            {needsVerification && (
              <Section style={styles.verificationNotice}>
                <Row>
                  <Column style={styles.verificationIconColumn}>
                    <Text style={styles.verificationIcon}>✉️</Text>
                  </Column>
                  <Column style={styles.verificationTextColumn}>
                    <Heading as="h3" style={styles.verificationHeading}>Email Verification Required</Heading>
                    <Text style={styles.verificationText}>
                      We've sent a separate verification email to <strong>{supplierEmail}</strong>. Please click the link in that email to verify your account before signing in.
                    </Text>
                  </Column>
                </Row>
              </Section>
            )}

            {/* Highlight Box */}
            <Section style={styles.highlightBox}>
              <Heading as="h3" style={styles.highlightHeading}>What Happens Next?</Heading>
              <Text style={styles.highlightText}>
                We'll review your profile within <strong>24 hours</strong> and get you live on our platform. In the meantime,
                complete your setup to start receiving bookings as soon as we approve you.
              </Text>
            </Section>

            {/* Next Steps */}
            <Heading as="h3" style={styles.stepsTitle}>Your Next Steps:</Heading>

            <Section style={styles.stepBox}>
              <Heading as="h4" style={styles.stepHeading}>1. Complete Your Profile</Heading>
              <Text style={styles.stepText}>
                Add photos, detailed descriptions, and set your pricing. Profiles with photos get <strong>5x more bookings</strong>.
              </Text>
            </Section>

            <Section style={styles.stepBox}>
              <Heading as="h4" style={styles.stepHeading}>2. Set Your Availability</Heading>
              <Text style={styles.stepText}>
                Configure your calendar so customers can only book when you're free. Update it anytime from your dashboard.
              </Text>
            </Section>

            <Section style={styles.stepBox}>
              <Heading as="h4" style={styles.stepHeading}>3. Create Your Packages</Heading>
              <Text style={styles.stepText}>
                Set up different service packages with clear pricing. Customers love having options to choose from.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={dashboardLink} style={styles.ctaButton}>
                Complete Your Setup
              </Button>
            </Section>

            {/* Stats Grid */}
            <Section style={styles.statsSection}>
              <Heading as="h3" style={styles.statsHeading}>Why PartySnap Works:</Heading>

              <Row style={styles.statsRow}>
                <Column style={styles.statColumn}>
                  <Text style={styles.statNumber}>10,000+</Text>
                  <Text style={styles.statLabel}>Happy Families</Text>
                </Column>
                <Column style={styles.statColumn}>
                  <Text style={styles.statNumber}>4.9★</Text>
                  <Text style={styles.statLabel}>Average Rating</Text>
                </Column>
              </Row>

              <Row style={styles.statsRow}>
                <Column style={styles.statColumn}>
                  <Text style={styles.statNumber}>500+</Text>
                  <Text style={styles.statLabel}>Active Suppliers</Text>
                </Column>
                <Column style={styles.statColumn}>
                  <Text style={styles.statNumber}>5x</Text>
                  <Text style={styles.statLabel}>More Bookings</Text>
                </Column>
              </Row>
            </Section>

            {/* Tips Box */}
            <Section style={styles.tipsBox}>
              <Heading as="h4" style={styles.tipsHeading}>Getting Started Tips:</Heading>
              <Text style={styles.tipItem}>• <strong>Upload high-quality photos:</strong> Showcasing your services in action</Text>
              <Text style={styles.tipItem}>• <strong>Write detailed descriptions:</strong> Help parents understand what makes you special</Text>
              <Text style={styles.tipItem}>• <strong>Set competitive pricing:</strong> Check similar suppliers in your area</Text>
              <Text style={styles.tipItem}>• <strong>Respond quickly:</strong> Fast responses lead to more bookings</Text>
            </Section>

            {/* Need Help Section */}
            <Section style={styles.helpSection}>
              <Heading as="h3" style={styles.helpHeading}>Need Help Getting Started?</Heading>
              <Text style={styles.helpText}>
                Our support team is here to help you succeed. Contact us anytime:
              </Text>
              <Text style={styles.contactDetail}><strong>Email:</strong> support@partysnap.uk</Text>
              <Text style={styles.contactDetail}><strong>Phone:</strong> 01234 567890</Text>
              <Text style={styles.contactDetail}><strong>Help Centre:</strong> help.partysnap.uk</Text>
            </Section>

            {/* Second CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={dashboardLink} style={styles.ctaButton}>
                Access Your Dashboard
              </Button>
              <Text style={styles.linkText}>Or copy this link: {dashboardLink}</Text>
            </Section>

            <Text style={styles.closing}>
              Ready to create magical moments for families?<br/>
              <strong>The PartySnap Team</strong><br/>
              Let's make parties unforgettable! 🎉
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
              You received this because you created a PartySnap Business account.
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
  welcomeBanner: {
    background: 'linear-gradient(135deg, #FC6B57, #FF8A80)',
    color: 'white',
    padding: '30px',
    textAlign: 'center',
  },
  bannerLogo: {
    maxWidth: '150px',
    height: 'auto',
    margin: '0 auto 20px',
  },
  bannerTitle: {
    margin: 0,
    fontSize: '32px',
    fontWeight: 'bold',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    color: 'white',
  },
  bannerSubtitle: {
    margin: '15px 0 0 0',
    fontSize: '18px',
    fontWeight: '500',
    opacity: 0.9,
    color: 'white',
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
    marginBottom: '20px',
  },
  verificationNotice: {
    backgroundColor: '#fefce8',
    border: '2px solid #facc15',
    borderRadius: '12px',
    padding: '20px',
    margin: '20px 0',
  },
  verificationIconColumn: {
    width: '40px',
    verticalAlign: 'top',
  },
  verificationIcon: {
    width: '40px',
    height: '40px',
    background: '#eab308',
    borderRadius: '50%',
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: '40px',
    margin: 0,
  },
  verificationTextColumn: {
    paddingLeft: '15px',
    verticalAlign: 'top',
  },
  verificationHeading: {
    color: '#ca8a04',
    margin: '0 0 10px 0',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  verificationText: {
    color: '#a16207',
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.5',
  },
  highlightBox: {
    background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
    border: '2px solid #0284c7',
    borderRadius: '12px',
    padding: '20px',
    margin: '20px 0',
  },
  highlightHeading: {
    color: '#0369a1',
    margin: '0 0 15px 0',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  highlightText: {
    color: '#075985',
    margin: 0,
    fontSize: '15px',
    lineHeight: '1.6',
  },
  stepsTitle: {
    color: '#374151',
    fontSize: '22px',
    fontWeight: 'bold',
    margin: '30px 0 20px 0',
  },
  stepBox: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    margin: '15px 0',
    borderLeft: '4px solid #FC6B57',
  },
  stepHeading: {
    color: '#FC6B57',
    margin: '0 0 10px 0',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  stepText: {
    color: '#4b5563',
    margin: 0,
    fontSize: '15px',
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
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
    padding: '25px',
    margin: '25px 0',
  },
  statsHeading: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
    marginBottom: '20px',
    color: '#2F2F2F',
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
    backgroundColor: '#dcfce7',
    borderRadius: '12px',
    padding: '20px',
    margin: '25px 0',
    border: '1px solid #bbf7d0',
  },
  tipsHeading: {
    color: '#15803d',
    marginBottom: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  tipItem: {
    color: '#166534',
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
