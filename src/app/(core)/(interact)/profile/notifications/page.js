import SwitchToggle from "@/components/SwitchToggle";

export default function NotificationsPage() {
    return (
        <div>
            <h1>Notifications</h1>
            <h2>Email notifications</h2>
            <form>
                <SwitchToggle label="New messages" checked={true} />
                <p>Receive an email when someone messages you</p>
            </form>
        </div>
    );
}
