import { UserProvider } from '@/contexts/UserContext';

export default async function RootLayout({ children }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <html>
            <body>
                <UserProvider user={user}>
                    {children}
                </UserProvider>
            </body>
        </html>
    );
}
