function NewsletterMetadata({ from, date, replyTo }) {
  const decodedAddress = atob(replyTo);
  return (
    <div>
      From: {from}
      <br />
      Date: {date}
      <br />
      Reply to: {decodedAddress}
    </div>
  );
}

export default NewsletterMetadata;
