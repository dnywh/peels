import { ThemeSwitcher } from "@/components/theme-switcher";

export default function AppearancePage() {
    return (
        <div>
            <h1>Appearance</h1>
            <div>
                <span>Theme</span>
                <ThemeSwitcher />
            </div>
        </div>
    );
}
