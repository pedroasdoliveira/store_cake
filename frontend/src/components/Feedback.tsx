import type { FeedbackMessage } from "../types";

export function Feedback({ message }: { message: FeedbackMessage | null }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`feedback ${message.type}`} role="status">
      {message.text}
    </div>
  );
}
