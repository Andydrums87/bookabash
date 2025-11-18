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

export default function CustomerResponseDeclined({
  customerName = 'there',
  supplierName = 'Supplier',
  childName = 'Child',
  theme = 'themed',
  partyDate = 'Party Date',
  serviceType = 'party services',
  supplierMessage = 'Thank you for your interest in our services.',
  dashboardLink = 'https://partysnap.co.uk/dashboard',
}) {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-darker-BtzC12IP4PmQu4X05qoZrrl5eFlqov.png"
              alt="BookABash Logo"
              style={styles.logo}
            />
          </Section>

          {/* Update Banner */}
          <Section style={styles.updateBanner}>
            <Heading as="h2" style={styles.bannerTitle}>📅 Booking Update</Heading>
            <Text style={styles.bannerSubtitle}>We're finding you the perfect alternative</Text>
          </Section>

          {/* Hero Image */}
          <Img
            src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1748527076/ChatGPT_Image_May_29_2025_02_57_49_PM_ttmzsw.png"
            alt="Party planning scene"
            style={styles.heroImage}
          />

          {/* Main Content */}
          <Section style={styles.content}>
            <Heading as="h1" style={styles.mainHeading}>Hi {customerName},</Heading>
            <Text style={styles.paragraph}>
              We have an update about your {serviceType} booking for {childName}'s {theme} party on {partyDate}.
            </Text>

            <Text style={styles.paragraph}>
              Unfortunately, {supplierName} is not available for your requested date. However, <strong>don't worry</strong> - we're already working to find you an excellent alternative supplier!
            </Text>

            {/* Supplier Message */}
            <Section style={styles.messageBox}>
              <Heading as="h3" style={styles.messageHeading}>📨 Message from {supplierName}:</Heading>
              <Section style={styles.messageContent}>
                <Text style={styles.messageText}>{supplierMessage}</Text>
              </Section>
            </Section>

            {/* What We're Doing Next */}
            <Section style={styles.stepsBox}>
              <Heading as="h3" style={styles.stepsHeading}>🔄 What We're Doing Next:</Heading>

              <Row style={styles.stepRow}>
                <Column style={styles.stepNumberColumn}>
                  <Text style={styles.stepNumber}>1</Text>
                </Column>
                <Column style={styles.stepTextColumn}>
                  <Heading as="h4" style={styles.stepTitle}>Finding Alternative Suppliers</Heading>
                  <Text style={styles.stepText}>
                    We're contacting other qualified {serviceType} suppliers in your area right now.
                  </Text>
                </Column>
              </Row>

              <Row style={styles.stepRow}>
                <Column style={styles.stepNumberColumn}>
                  <Text style={styles.stepNumber}>2</Text>
                </Column>
                <Column style={styles.stepTextColumn}>
                  <Heading as="h4" style={styles.stepTitle}>Same Great Service</Heading>
                  <Text style={styles.stepText}>
                    Your new supplier will provide the same {serviceType} at the same price point.
                  </Text>
                </Column>
              </Row>

              <Row style={styles.stepRow}>
                <Column style={styles.stepNumberColumn}>
                  <Text style={styles.stepNumber}>3</Text>
                </Column>
                <Column style={styles.stepTextColumn}>
                  <Heading as="h4" style={styles.stepTitle}>Quick Confirmation</Heading>
                  <Text style={styles.stepText}>
                    We'll email you within 24 hours with your new supplier's details and confirmation.
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* CTA Button */}
            <Section style={styles.ctaSection}>
              <Button href={dashboardLink} style={styles.ctaButton}>
                📱 View Booking Status
              </Button>
            </Section>

            {/* Questions Box */}
            <Section style={styles.questionsBox}>
              <Heading as="h4" style={styles.questionsHeading}>💬 Questions or Concerns?</Heading>
              <Text style={styles.questionsText}>
                Our team is here to help! Call us at <strong>0800 123 4567</strong> or reply to this email.
                We're committed to making {childName}'s party absolutely magical.
              </Text>
            </Section>

            <Text style={styles.closing}>
              Best regards,<br/>
              <strong>The BookABash Team</strong><br/>
              Making party planning magical ✨
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Img
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png"
              alt="BookABash"
              style={styles.footerLogo}
            />
            <Text style={styles.footerText}>PartySnap Ltd, 123 Party Street, London, UK</Text>
            <Text style={styles.footerSmall}>
              You received this email because you booked a party through PartySnap.
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
  header: {
    padding: '30px 20px',
    textAlign: 'center',
  },
  logo: {
    maxWidth: '200px',
    height: 'auto',
    margin: '0 auto',
  },
  updateBanner: {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: 'white',
    padding: '20px',
    textAlign: 'center',
  },
  bannerTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
  },
  bannerSubtitle: {
    margin: '10px 0 0 0',
    fontSize: '16px',
    color: 'white',
  },
  heroImage: {
    width: '100%',
    height: 'auto',
  },
  content: {
    padding: '40px 30px',
    backgroundColor: '#FFFFFF',
    color: '#2F2F2F',
  },
  mainHeading: {
    color: '#2F2F2F',
    fontSize: '28px',
    margin: '0 0 20px 0',
  },
  paragraph: {
    color: '#707070',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0 0 20px 0',
  },
  messageBox: {
    backgroundColor: '#fff7ed',
    borderRadius: '12px',
    padding: '25px',
    margin: '25px 0',
    borderLeft: '4px solid #f59e0b',
  },
  messageHeading: {
    color: '#f59e0b',
    marginBottom: '15px',
    fontSize: '18px',
  },
  messageContent: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #fed7aa',
  },
  messageText: {
    color: '#374151',
    fontStyle: 'italic',
    margin: 0,
    fontSize: '16px',
  },
  stepsBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
    padding: '25px',
    margin: '25px 0',
  },
  stepsHeading: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
    marginBottom: '20px',
    color: '#2F2F2F',
  },
  stepRow: {
    marginBottom: '15px',
  },
  stepNumberColumn: {
    width: '40px',
    verticalAlign: 'top',
  },
  stepNumber: {
    background: '#FC6B57',
    color: 'white',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    fontWeight: 'bold',
    fontSize: '12px',
    textAlign: 'center',
    lineHeight: '28px',
    margin: 0,
  },
  stepTextColumn: {
    paddingLeft: '12px',
    verticalAlign: 'top',
  },
  stepTitle: {
    margin: '0 0 5px 0',
    color: '#2F2F2F',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  stepText: {
    margin: 0,
    color: '#707070',
    fontSize: '13px',
    lineHeight: '1.5',
  },
  ctaSection: {
    textAlign: 'center',
    margin: '30px 0',
  },
  ctaButton: {
    backgroundColor: '#FC6B57',
    color: 'white',
    padding: '16px 32px',
    borderRadius: '25px',
    fontWeight: 'bold',
    fontSize: '16px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  questionsBox: {
    backgroundColor: '#dbeafe',
    borderRadius: '12px',
    padding: '20px',
    margin: '25px 0',
  },
  questionsHeading: {
    color: '#1d4ed8',
    marginBottom: '10px',
    fontSize: '16px',
  },
  questionsText: {
    color: '#1e3a8a',
    margin: 0,
    fontSize: '14px',
  },
  closing: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#707070',
    marginTop: '40px',
  },
  footer: {
    backgroundColor: '#2F2F2F',
    color: '#FFFFFF',
    padding: '30px',
    textAlign: 'center',
  },
  footerLogo: {
    maxWidth: '120px',
    height: 'auto',
    margin: '0 auto 20px',
    opacity: 0.9,
  },
  footerText: {
    margin: '10px 0',
    color: '#FFFFFF',
    fontSize: '14px',
  },
  footerSmall: {
    fontSize: '12px',
    opacity: 0.8,
    margin: '5px 0',
    color: '#FFFFFF',
  },
};
