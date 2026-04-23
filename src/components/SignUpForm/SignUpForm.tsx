"use client";
import { signUpAction } from "@/app/actions";
import Button from "@/components/Button";
import CheckboxCluster from "@/components/CheckboxCluster";
import CheckboxRow from "@/components/CheckboxRow";
import EncodedEmailLink from "@/components/EncodedEmailLink";
import Field from "@/components/Field";
import Form from "@/components/Form";
import FormMessage from "@/components/FormMessage";
import Input from "@/components/Input";
import InputHint from "@/components/InputHint";
import Label from "@/components/Label";
import LegalAgreement from "@/components/LegalAgreement";
import { siteConfig } from "@/config/site";
import { FIELD_CONFIGS, validateFirstName } from "@/lib/formValidation";
import { getStoredAttributionParams } from "@/utils/attributionUtils";
import { isTurnstileEnabled } from "@/utils/utils";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface SignUpFormProps {
  defaultValues?: {
    first_name?: string;
    email?: string;
    newsletter_preference?: boolean;
  };
  error?: string;
}

const BACKGROUND_TOKEN_TIMEOUT = 10000;
const INTERACTIVE_TOKEN_TIMEOUT = 120000;

export default function SignUpForm({
  defaultValues = {},
  error,
}: SignUpFormProps) {
  const t = useTranslations();
  const expiredMessage = t("Auth.turnstile.expired");
  const timeoutMessage = t("Auth.turnstile.timeout");
  const unsupportedMessage = t("Auth.turnstile.unsupported");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);

  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [isWaitingForToken, setIsWaitingForToken] = useState(false);
  const [isTurnstileInteractive, setIsTurnstileInteractive] = useState(false);

  const turnstileRef = useRef<TurnstileInstance>(null);
  const tokenResolverRef = useRef<((token: string) => void) | null>(null);
  const tokenRejecterRef = useRef<((error: Error) => void) | null>(null);
  const tokenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const turnstileEnabled = isTurnstileEnabled();
  const fieldErrorCount =
    Number(Boolean(firstNameError)) + Number(Boolean(captchaError));
  const hasFieldErrors = fieldErrorCount > 0;

  const clearTokenTimeout = useCallback(() => {
    if (tokenTimeoutRef.current) {
      clearTimeout(tokenTimeoutRef.current);
      tokenTimeoutRef.current = null;
    }
  }, []);

  const clearTokenPromise = useCallback(() => {
    tokenResolverRef.current = null;
    tokenRejecterRef.current = null;
    clearTokenTimeout();
  }, [clearTokenTimeout]);

  const rejectTokenPromise = useCallback(
    (errorMessage: string) => {
      if (tokenRejecterRef.current) {
        tokenRejecterRef.current(new Error(errorMessage));
      }
      clearTokenPromise();
    },
    [clearTokenPromise]
  );

  const scheduleTokenTimeout = useCallback(
    (timeout: number, errorMessage = timeoutMessage) => {
      clearTokenTimeout();
      tokenTimeoutRef.current = setTimeout(() => {
        rejectTokenPromise(errorMessage);
      }, timeout);
    },
    [clearTokenTimeout, rejectTokenPromise, timeoutMessage]
  );

  // Promise-based token wait mechanism with timeout
  const waitForToken = useCallback(
    (timeout = BACKGROUND_TOKEN_TIMEOUT): Promise<string> => {
      return new Promise((resolve, reject) => {
        // Store resolvers for onSuccess/onError callbacks
        tokenResolverRef.current = resolve;
        tokenRejecterRef.current = reject;

        scheduleTokenTimeout(timeout);
      });
    },
    [scheduleTokenTimeout]
  );

  const resolveTokenPromise = useCallback(
    (token: string) => {
      if (tokenResolverRef.current) {
        tokenResolverRef.current(token);
      }
      clearTokenPromise();
    },
    [clearTokenPromise]
  );

  useEffect(() => clearTokenTimeout, [clearTokenTimeout]);

  const handleTurnstileSuccess = useCallback(
    (token: string) => {
      setCaptchaError(null);
      setIsWaitingForToken(false);
      setIsTurnstileInteractive(false);
      resolveTokenPromise(token);
    },
    [resolveTokenPromise]
  );

  const handleTurnstileError = useCallback(
    (error: string) => {
      setIsWaitingForToken(false);
      setIsTurnstileInteractive(false);

      const errorMessage = t("Auth.turnstile.failed", { code: error });

      setCaptchaError(errorMessage);
      rejectTokenPromise(errorMessage);
    },
    [rejectTokenPromise, t]
  );

  const handleTurnstileExpire = useCallback(() => {
    setIsWaitingForToken(false);
    setIsTurnstileInteractive(false);
    setCaptchaError(expiredMessage);
    rejectTokenPromise(expiredMessage);
  }, [expiredMessage, rejectTokenPromise]);

  const handleTurnstileTimeout = useCallback(() => {
    setIsWaitingForToken(false);
    setIsTurnstileInteractive(false);
    setCaptchaError(timeoutMessage);
    rejectTokenPromise(timeoutMessage);
  }, [rejectTokenPromise, timeoutMessage]);

  const handleTurnstileUnsupported = useCallback(() => {
    setIsWaitingForToken(false);
    setIsTurnstileInteractive(false);
    setCaptchaError(unsupportedMessage);
    rejectTokenPromise(unsupportedMessage);
  }, [rejectTokenPromise, unsupportedMessage]);

  const handleTurnstileBeforeInteractive = useCallback(() => {
    setCaptchaError(null);
    setIsTurnstileInteractive(true);
    scheduleTokenTimeout(INTERACTIVE_TOKEN_TIMEOUT);
  }, [scheduleTokenTimeout]);

  const handleTurnstileAfterInteractive = useCallback(() => {
    setIsTurnstileInteractive(false);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || isWaitingForToken) return;

    // Reset validation errors
    setFirstNameError(null);
    setCaptchaError(null);

    // Client-side validation
    const formData = new FormData(event.currentTarget);
    const validation = validateFirstName(
      formData.get("first_name")?.toString()
    );
    if (!validation.isValid) {
      switch (validation.error) {
        case "empty":
          setFirstNameError(t("Errors.emptyName"));
          break;
        case "tooShort":
          setFirstNameError(t("Errors.firstNameTooShort"));
          break;
        case "tooLong":
          setFirstNameError(t("Errors.firstNameTooLong"));
          break;
        case "invalidChars":
          setFirstNameError(t("Errors.firstNameInvalidChars"));
          break;
        case "forbiddenContent":
        case "reserved":
          setFirstNameError(t("Errors.firstNameNotAllowed"));
          break;
        default:
          setFirstNameError(t("Errors.generic"));
      }
      return;
    }

    // Handle Turnstile token generation if enabled
    // Always get a fresh token as they are single-use and never reused
    let tokenToUse: string | undefined;
    if (turnstileEnabled) {
      // Reset any existing token to ensure we get a fresh one
      turnstileRef.current?.reset();

      setIsWaitingForToken(true);
      try {
        // Start waiting before execution so a fast success callback cannot race us.
        const tokenPromise = waitForToken(BACKGROUND_TOKEN_TIMEOUT);

        turnstileRef.current?.execute();

        // Wait for token with timeout
        tokenToUse = await tokenPromise;

        // Token obtained, proceed with submission
        setIsWaitingForToken(false);
        setIsSubmitting(true);
      } catch (error) {
        setIsWaitingForToken(false);
        setCaptchaError(
          error instanceof Error ? error.message : timeoutMessage
        );
        return;
      }
    } else {
      setIsSubmitting(true);
    }

    try {
      // Add captcha token to form data if available
      if (tokenToUse) {
        formData.append("captcha_token", tokenToUse);
      }

      // Add stored UTM parameters to form data
      const utmParams = getStoredAttributionParams();
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value && typeof value === "string") formData.append(key, value);
      });

      await signUpAction(formData);
    } catch (error) {
      console.error("Sign up error:", error);
      setIsSubmitting(false);
    }
  };

  const turnstileProps = {
    ref: turnstileRef,
    siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY!,
    onSuccess: handleTurnstileSuccess,
    onError: handleTurnstileError,
    onExpire: handleTurnstileExpire,
    onTimeout: handleTurnstileTimeout,
    onUnsupported: handleTurnstileUnsupported,
    onBeforeInteractive: handleTurnstileBeforeInteractive,
    onAfterInteractive: handleTurnstileAfterInteractive,
    options: {
      appearance: "interaction-only",
      execution: "execute",
      responseField: false,
    } as const,
  };

  const turnstileContainerStyle = useMemo(
    () =>
      isTurnstileInteractive || captchaError
        ? undefined
        : ({
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clipPath: "inset(50%)",
          } as const),
    [captchaError, isTurnstileInteractive]
  );

  return (
    <Form onSubmit={handleSubmit}>
      <Field>
        <Label htmlFor="first_name">{t("Auth.signUp.firstName")}</Label>
        <Input
          name="first_name"
          {...FIELD_CONFIGS.firstName}
          defaultValue={defaultValues.first_name}
          // @ts-expect-error: Input accepts any truthy value at runtime for error, but type is inferred as null | undefined
          error={firstNameError}
        />
        {firstNameError && (
          <InputHint variant="error">{firstNameError}</InputHint>
        )}
      </Field>

      <Field>
        <Label htmlFor="email">{t("Common.email")}</Label>
        <Input
          name="email"
          {...FIELD_CONFIGS.email}
          defaultValue={defaultValues.email}
        />
      </Field>

      <Field>
        <Label htmlFor="password">{t("Common.password")}</Label>
        <Input
          name="password"
          {...FIELD_CONFIGS.password}
          placeholder={t("Auth.signUp.newPassword")}
        />
      </Field>

      <CheckboxCluster>
        <LegalAgreement required={true} />
        <CheckboxRow
          name="newsletter_preference"
          required={false}
          defaultChecked={defaultValues.newsletter_preference}
        >
          {t("Auth.signUp.newsletterOptIn")}
        </CheckboxRow>
      </CheckboxCluster>

      {turnstileEnabled && (
        <Field style={turnstileContainerStyle}>
          <Turnstile {...turnstileProps} />
          {captchaError && (
            <InputHint variant="error">{captchaError}</InputHint>
          )}
        </Field>
      )}

      {(error || hasFieldErrors) && (
        <FormMessage
          message={{
            error: error
              ? t.rich("Auth.signUp.errorWithSupport", {
                  error: error.endsWith(".") ? error : `${error}.`,
                  link: (chunks) => (
                    <EncodedEmailLink address={siteConfig.encodedEmail.support}>
                      {chunks}
                    </EncodedEmailLink>
                  ),
                })
              : hasFieldErrors
                ? t("Errors.validationSummary", { count: fieldErrorCount })
                : t("Errors.generic"),
          }}
        />
      )}

      <Button
        type="submit"
        variant="primary"
        width="full"
        loading={isSubmitting || isWaitingForToken}
        loadingText={
          isWaitingForToken ? t("Status.verifying") : t("Status.signingUp")
        }
        disabled={isSubmitting || isWaitingForToken}
      >
        {t("Actions.signUp")}
      </Button>
    </Form>
  );
}
