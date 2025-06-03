import FaqContainer from "@/components/FaqContainer";
import FaqDetails from "@/components/FaqDetails";

// FAQ for using Peels
function SupportFaq() {
  return (
    <FaqContainer>
      <FaqDetails>
        <summary>How do I manage which emails I receive?</summary>
        <p>
          We only send emails that are necessary to keep Peels working. That
          includes one or two account-related emails, and emails to notify you
          whenever a fellow Peels member has sent you message.
        </p>
        <p>
          Email notifications are required for listing hosts, as it means a
          prospective donor has enquired about dropping off scraps (or picking
          something up). Hosts who longer wish to receive emails can either hide
          their listing from the map (making it impossible for new donors to
          reach out) or delete their listing entirely (meaning previous donors
          can no longer message, either).
        </p>
        <p>
          People without listings cannot be messaged (and thus emailed) unless
          they initiate contact with a host first.
        </p>
        <p>
          Anyone can report or block individual Peels members via our messaging
          system. Blocking someone means they can no longer message or email
          you.
        </p>
      </FaqDetails>
    </FaqContainer>
  );
}

export default SupportFaq;
