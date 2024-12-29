import Link from 'next/link';

export default function AccountPage() {
    return (
        <div>
            <Link href="/profile">Back to profile (only shown on mobile)</Link>
            <h1>Account</h1>
            <form>
                <label>Email: <input type="email" /></label>
                <label>Password: <input type="password" /></label>
            </form>
        </div>
    );
}
