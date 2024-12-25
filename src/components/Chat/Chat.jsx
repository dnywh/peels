import { useState } from "react";

function Chat({ user, listing, setIsChatOpen }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Sending following message to ${listing.name}: ${message}`);
  };

  return (
    <div>
      <button onClick={() => setIsChatOpen(false)}>Close chat</button>
      <p>User viewing {user.email}</p>
      <p>About to message {listing.name}</p>

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder={`Send a message to ${listing.name}...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
