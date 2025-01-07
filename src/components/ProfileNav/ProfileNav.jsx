"use client";
import { usePathname } from "next/navigation";

export default function ProfileNav() {
  const pathname = usePathname();

  return (
    <nav>
      <ul>
        {[
          { href: "/profile/account", label: "Account" },
          { href: "/profile/notifications", label: "Notifications" },
          { href: "/profile/appearance", label: "Appearance" },
        ].map(({ href, label }) => (
          <li key={href}>
            <a
              href={href}
              className={`block p-2 rounded-lg transition-colors
                                ${
                                  pathname === href
                                    ? "bg-secondary"
                                    : "hover:bg-secondary/50"
                                }`}
              style={{
                backgroundColor: pathname === href ? "lightgray" : undefined,
              }}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
