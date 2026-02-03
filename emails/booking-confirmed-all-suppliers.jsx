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
  Hr,
} from '@react-email/components';

// Helper to capitalize each word in a name (e.g., "andrew joseph" -> "Andrew Joseph")
const capitalizeName = (name) => {
  if (!name) return name;
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function BookingConfirmedAllSuppliers({
  customerName = 'there',
  childName = 'Child',
  theme = 'themed',
  partyDate = 'Party Date',
  partyTime = 'TBC',
  venue = null,
  services = [],
  totalValue = 0,
  dashboardLink = 'https://partysnap.co.uk/dashboard',
  einvitesLink = 'https://partysnap.co.uk/dashboard?tab=invites',
}) {
  const hasVenue = venue && venue.name;
  const formattedChildName = capitalizeName(childName);
  const formattedCustomerName = customerName === 'there' ? 'there' : capitalizeName(customerName);

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Img
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755683308/htcj5jfuh96hf6r65csk.png"
              alt="PartySnap"
              style={styles.logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            {/* Success Icon */}
            <Section style={styles.iconSection}>
              <Text style={styles.successIcon}>✓</Text>
            </Section>

            <Heading style={styles.title}>You're all set!</Heading>
            <Text style={styles.subtitle}>
              Everything's confirmed for {formattedChildName}'s party
            </Text>

            <Hr style={styles.divider} />

            <Text style={styles.greeting}>Hi {formattedCustomerName},</Text>

            <Text style={styles.paragraph}>
              Great news – we've confirmed everything for {formattedChildName}'s {theme} party.
              All your suppliers are booked and ready to make the day special.
            </Text>

            <Text style={styles.paragraph}>
              You can sit back and relax – we've got it from here.
            </Text>

            {/* Party Details */}
            <Section style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>{formattedChildName}'s {theme} Party</Text>

              <Row style={styles.detailRow}>
                <Column style={styles.detailLabel}>Date</Column>
                <Column style={styles.detailValue}>{partyDate}</Column>
              </Row>

              <Row style={styles.detailRow}>
                <Column style={styles.detailLabel}>Time</Column>
                <Column style={styles.detailValue}>{partyTime || 'TBC'}</Column>
              </Row>

              {hasVenue && (
                <Row style={styles.detailRow}>
                  <Column style={styles.detailLabel}>Venue</Column>
                  <Column style={styles.detailValue}>
                    {venue.name}
                    {venue.address && <Text style={styles.venueAddress}>{venue.address}</Text>}
                  </Column>
                </Row>
              )}
            </Section>

            {/* What's Booked */}
            <Text style={styles.sectionTitle}>What's booked</Text>

            {services.map((service, index) => (
              <Section key={index} style={styles.serviceRow}>
                <Row>
                  <Column style={styles.serviceCheck}>✓</Column>
                  <Column style={styles.serviceInfo}>
                    <Text style={styles.serviceCategory}>{service.category}</Text>
                    {service.packageName && (
                      <Text style={styles.packageName}>{service.packageName}</Text>
                    )}
                  </Column>
                  <Column style={styles.servicePrice}>£{service.price}</Column>
                </Row>
              </Section>
            ))}

            <Section style={styles.totalRow}>
              <Row>
                <Column><Text style={styles.totalLabel}>Total</Text></Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={styles.totalValue}>£{totalValue.toFixed(2)}</Text>
                </Column>
              </Row>
            </Section>

            <Hr style={styles.divider} />

            {/* What Happens Next */}
            <Text style={styles.sectionTitle}>What happens next</Text>

            <Text style={styles.stepText}>
              <strong>1.</strong> We'll coordinate with your suppliers to make sure everything runs smoothly.
            </Text>
            <Text style={styles.stepText}>
              <strong>2.</strong> We'll send you a reminder a week before with a final run-through.
            </Text>
            <Text style={styles.stepText}>
              <strong>3.</strong> On the day, your suppliers arrive ready to go – you just enjoy the party!
            </Text>

            {/* CTA */}
            <Section style={styles.ctaSection}>
              <Button href={dashboardLink} style={styles.ctaButton}>
                View Party Dashboard
              </Button>
            </Section>

            {/* E-Invites */}
            <Section style={styles.invitesSection}>
              <Text style={styles.invitesTitle}>Ready to send invites?</Text>
              <Text style={styles.invitesText}>
                Create free digital invitations and track RSVPs in your dashboard.
              </Text>
              <Button href={einvitesLink} style={styles.invitesButton}>
                Create E-Invites
              </Button>
            </Section>

            <Hr style={styles.divider} />

            {/* Support */}
            <Text style={styles.supportText}>
              Questions? We're here to help.
            </Text>
            <Text style={styles.contactInfo}>
              📧 hello@partysnap.co.uk · 📞 07123 456789
            </Text>

            <Text style={styles.closing}>
              The PartySnap Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              PartySnap · Making kids' parties effortless
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
    padding: 0,
    backgroundColor: '#f5f5f5',
    color: '#1a1a1a',
  },
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
  },
  header: {
    padding: '32px 24px 24px',
    textAlign: 'center',
    borderBottom: '1px solid #e5e5e5',
  },
  logo: {
    maxWidth: '120px',
    height: 'auto',
  },
  content: {
    padding: '32px 24px',
  },
  iconSection: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  successIcon: {
    display: 'inline-block',
    width: '48px',
    height: '48px',
    lineHeight: '48px',
    borderRadius: '50%',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '0 auto',
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666666',
    textAlign: 'center',
    margin: '0 0 24px 0',
  },
  divider: {
    borderTop: '1px solid #e5e5e5',
    margin: '24px 0',
  },
  greeting: {
    fontSize: '16px',
    color: '#1a1a1a',
    margin: '0 0 16px 0',
  },
  paragraph: {
    fontSize: '15px',
    color: '#444444',
    lineHeight: '1.6',
    margin: '0 0 16px 0',
  },
  detailsCard: {
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0',
  },
  detailsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 16px 0',
  },
  detailRow: {
    marginBottom: '8px',
  },
  detailLabel: {
    fontSize: '14px',
    color: '#666666',
    width: '60px',
  },
  detailValue: {
    fontSize: '14px',
    color: '#1a1a1a',
    fontWeight: '500',
  },
  venueAddress: {
    fontSize: '13px',
    color: '#666666',
    fontWeight: '400',
    margin: '2px 0 0 0',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 16px 0',
  },
  serviceRow: {
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  serviceCheck: {
    width: '24px',
    fontSize: '14px',
    color: '#1a1a1a',
    fontWeight: '600',
  },
  serviceInfo: {
    paddingLeft: '4px',
  },
  serviceCategory: {
    fontSize: '15px',
    color: '#1a1a1a',
    fontWeight: '500',
    margin: 0,
    textTransform: 'capitalize',
  },
  packageName: {
    fontSize: '13px',
    color: '#666666',
    margin: '2px 0 0 0',
  },
  servicePrice: {
    fontSize: '15px',
    color: '#1a1a1a',
    fontWeight: '500',
    textAlign: 'right',
    width: '70px',
  },
  totalRow: {
    paddingTop: '16px',
    marginTop: '8px',
  },
  totalLabel: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: 0,
  },
  totalValue: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: 0,
  },
  stepText: {
    fontSize: '14px',
    color: '#444444',
    lineHeight: '1.6',
    margin: '0 0 12px 0',
  },
  ctaSection: {
    textAlign: 'center',
    margin: '32px 0',
  },
  ctaButton: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '15px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  invitesSection: {
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    margin: '0 0 24px 0',
  },
  invitesTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 8px 0',
  },
  invitesText: {
    fontSize: '14px',
    color: '#666666',
    margin: '0 0 16px 0',
  },
  invitesButton: {
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '14px',
    textDecoration: 'none',
    display: 'inline-block',
    border: '1px solid #d5d5d5',
  },
  supportText: {
    fontSize: '14px',
    color: '#666666',
    textAlign: 'center',
    margin: '0 0 8px 0',
  },
  contactInfo: {
    fontSize: '14px',
    color: '#1a1a1a',
    textAlign: 'center',
    fontWeight: '500',
    margin: '0 0 24px 0',
  },
  closing: {
    fontSize: '15px',
    color: '#1a1a1a',
    fontWeight: '500',
    margin: 0,
  },
  footer: {
    backgroundColor: '#fafafa',
    padding: '20px 24px',
    textAlign: 'center',
    borderTop: '1px solid #e5e5e5',
  },
  footerText: {
    fontSize: '13px',
    color: '#888888',
    margin: 0,
  },
};
