

import Form from "@/components/Form";
import Field from "@/components/Field";
import Label from "@/components/Label";
import Select from "@/components/Select";
import Description from "@/components/Description";


export default function AppearancePage() {

    return (
        <div>
            <h1>Appearance</h1>
            <div>
                <h2>Theme</h2>
                <Field>
                    <Label>Light or dark mode</Label>
                    {/* TODO: Replace the above theme switcher with my own UX, as shown below. This must be done in a client component, as per the useTheme hook above. Follow the pattern set in ThemeSwitcher.tsx */}
                    {/* <Select value={theme} onChange={(e) => setTheme(e.target.value)}>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">Sync with my device</option>
                    </Select> */}
                    {/* {theme === "system" && <Description>The theme is inherited from your device settings.</Description>} */}
                </Field>
            </div>
        </div>
    );
}
