import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
} from '@react-email/components';

export default function EarlyAccessSignup() {
  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.companyName}>PartySnap</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Heading style={styles.title}>You're on the list!</Heading>
            <Text style={styles.text}>
              Thanks for signing up for early access to PartySnap.
            </Text>
            <Text style={styles.text}>
              We'll keep you updated on our progress and let you know as soon as we launch.
              As an early supporter, you'll also have the chance to earn <strong>founder credits</strong> when we go live.
            </Text>
            <Text style={styles.text}>
              Stay tuned!
            </Text>
            <Text style={styles.signature}>
              — The PartySnap Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              You received this email because you signed up at www.partysnap.co.uk
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
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  },
  header: {
    padding: '40px 30px',
    textAlign: 'center',
    backgroundColor: '#FF7247',
  },
  companyName: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.5px',
  },
  content: {
    padding: '40px 30px',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 25px 0',
    fontSize: '28px',
    fontWeight: '600',
    color: '#FF7247',
    letterSpacing: '-0.5px',
  },
  text: {
    margin: '0 0 20px 0',
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.6',
  },
  signature: {
    margin: '30px 0 0 0',
    fontSize: '16px',
    color: '#1a1a1a',
    fontWeight: '500',
  },
  footer: {
    padding: '20px 30px',
    backgroundColor: '#f9fafb',
    textAlign: 'center',
  },
  footerText: {
    margin: 0,
    fontSize: '12px',
    color: '#9ca3af',
  },
};
