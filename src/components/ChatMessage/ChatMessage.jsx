import StorageImage from "@/components/StorageImage";
import { formatDate } from "@/utils/dateUtils";

function ChatMessage({ direction, message }) {
  return (
    <div className={direction} style={{ border: "1px solid grey" }}>
      {message.sender_avatar && (
        <StorageImage
          bucket="avatars"
          filename={message.sender_avatar}
          alt={`Avatar for ${message.sender_first_name}`}
          style={{ width: "64px", height: "64px" }}
        />
      )}
      <p>{message.content}</p>
      <p>
        <small>Sent by {message.sender_first_name}</small>
      </p>
      <p>
        <small>{formatDate(message.created_at)}</small>
      </p>
    </div>
  );
}

export default ChatMessage;
