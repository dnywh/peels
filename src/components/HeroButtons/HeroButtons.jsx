"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useTranslations } from "next-intl";
import Button from "@/components/Button";
import { styled } from "@pigment-css/react";

export default function HeroButtons() {
  const t = useTranslations("Index.buttons");
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }

    loadUser();
  }, []);

  return (
    <ButtonContainer>
      <Button href="/map" variant="primary" size="massive">
        {t("browseMap")}
      </Button>
      {user ? (
        <Button href="/profile/listings/new" variant="secondary" size="massive">
          {t("addListing")}
        </Button>
      ) : (
        <Button href="/sign-up" variant="secondary" size="massive">
          {t("signUp")}
        </Button>
      )}
    </ButtonContainer>
  );
}

const ButtonContainer = styled("div")(({ theme }) => ({
  marginTop: "1rem",
  width: "100%",
  maxWidth: theme.spacing.tabBar.maxWidth, // Visually match width of tab bar on mobile
  justifyContent: "center",
  display: "flex",
  flexDirection: "column",
  gap: `calc(${theme.spacing.unit} * 2)`,

  "@media (min-width: 768px)": {
    marginTop: "2rem",
    width: "fit-content",
    maxWidth: "none",
    flexDirection: "row",
  },
}));
