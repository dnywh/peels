export type Message = {
  error?: string;
  success?: string;
};

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in message && (
        <div className="text-foreground border-l-2 border-foreground px-4">
          {message.success}
        </div>
      )}
      {"error" in message && (
        // TODO: fix styles (not showing up correctly in light mode)
        <div className="text-destructive-foreground border-l-2 border-destructive-foreground px-4">
          {message.error}
        </div>
      )}
    </div>
  );
}
