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
import { FIELD_CONFIGS, validateName } from "@/lib/formValidation";
import { getStoredAttributionParams } from "@/utils/attributionUtils";
import { isTurnstileEnabled } from "@/utils/utils";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useCallback, useEffect, useRef, useState } from "react";

interface SignUpFormProps {
  defaultValues?: {
    first_name?: string;
    email?: string;
    newsletter_preference?: boolean;
  };
  error?: string;
}

const TOKEN_TIMEOUT = 10000;
const EXPIRED_MESSAGE = "Verification expired. Please complete it again.";
const TIMEOUT_MESSAGE =
  "Security verification is taking longer than expected. Please try again.";

export default function SignUpForm({
  defaultValues = {},
  error,
}: SignUpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);

  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [isWaitingForToken, setIsWaitingForToken] = useState(false);
  const [showTurnstileField, setShowTurnstileField] = useState(false);

  const turnstileRef = useRef<TurnstileInstance>(null);
  const tokenResolverRef = useRef<((token: string) => void) | null>(null);
  const tokenRejecterRef = useRef<((error: Error) => void) | null>(null);

  const hasFieldErrors = Boolean(firstNameError || captchaError);

  // Only show field wrapper when there's an error (invisible mode handles normal flow)
  useEffect(() => {
    setShowTurnstileField(!!captchaError);
  }, [captchaError]);

  // Promise-based token wait mechanism with timeout
  const waitForToken = useCallback(
    (timeout = TOKEN_TIMEOUT): Promise<string> => {
      return new Promise((resolve, reject) => {
        // Store resolvers for onSuccess/onError callbacks
        tokenResolverRef.current = resolve;
        tokenRejecterRef.current = reject;

        // Timeout after specified duration
        setTimeout(() => {
          if (tokenRejecterRef.current) {
            tokenRejecterRef.current(new Error("Token generation timeout"));
            tokenResolverRef.current = null;
            tokenRejecterRef.current = null;
          }
        }, timeout);
      });
    },
    []
  );

  const resolveTokenPromise = useCallback((token: string) => {
    if (tokenResolverRef.current) {
      tokenResolverRef.current(token);
      tokenResolverRef.current = null;
      tokenRejecterRef.current = null;
    }
  }, []);

  const rejectTokenPromise = useCallback((errorMessage: string) => {
    if (tokenRejecterRef.current) {
      tokenRejecterRef.current(new Error(errorMessage));
      tokenResolverRef.current = null;
      tokenRejecterRef.current = null;
    }
  }, []);

  const handleTurnstileSuccess = useCallback(
    (token: string) => {
      setCaptchaError(null);
      setIsWaitingForToken(false);
      resolveTokenPromise(token);
    },
    [resolveTokenPromise]
  );

  const handleTurnstileError = useCallback(
    (error: string) => {
      setIsWaitingForToken(false);

      const errorMessage = `Security verification failed with error #${error}. Please try again or use a different browser.`;

      setCaptchaError(errorMessage);
      rejectTokenPromise(errorMessage);
    },
    [rejectTokenPromise]
  );

  const handleTurnstileExpire = useCallback(() => {
    setIsWaitingForToken(false);
    setCaptchaError(EXPIRED_MESSAGE);
    rejectTokenPromise(EXPIRED_MESSAGE);
  }, [rejectTokenPromise]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || isWaitingForToken) return;

    // Reset validation errors
    setFirstNameError(null);
    setCaptchaError(null);

    // Client-side validation
    const formData = new FormData(event.currentTarget);
    const validation = validateName(formData.get("first_name")?.toString());
    if (!validation.isValid) {
      setFirstNameError(validation.error ?? null);
      return;
    }

    // Handle Turnstile token generation if enabled
    // Always get a fresh token as they are single-use and never reused
    let tokenToUse: string | undefined;
    if (isTurnstileEnabled()) {
      // Reset any existing token to ensure we get a fresh one

      turnstileRef.current?.reset();

      setIsWaitingForToken(true);
      try {
        // Execute Turnstile verification
        turnstileRef.current?.execute();

        // Wait for token with timeout
        tokenToUse = await waitForToken(TOKEN_TIMEOUT);

        // Token obtained, proceed with submission
        setIsWaitingForToken(false);
        setIsSubmitting(true);
      } catch (error) {
        setIsWaitingForToken(false);
        setCaptchaError(
          error instanceof Error ? error.message : TIMEOUT_MESSAGE
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
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Field>
        <Label htmlFor="first_name">First name</Label>
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
        <Label htmlFor="email">Email</Label>
        <Input
          name="email"
          {...FIELD_CONFIGS.email}
          defaultValue={defaultValues.email}
        />
      </Field>

      <Field>
        <Label htmlFor="password">Password</Label>
        <Input
          name="password"
          {...FIELD_CONFIGS.password}
          placeholder="Your new password"
        />
      </Field>

      <CheckboxCluster>
        <LegalAgreement required={true} />
        <CheckboxRow
          name="newsletter_preference"
          required={false}
          defaultChecked={defaultValues.newsletter_preference}
        >
          Send me occasional email updates about Peels
        </CheckboxRow>
      </CheckboxCluster>

      {isTurnstileEnabled() &&
        (showTurnstileField ? (
          <Field>
            <Turnstile {...turnstileProps} options={{ execution: "execute" }} />
            {captchaError && (
              <InputHint variant="error">{captchaError}</InputHint>
            )}
          </Field>
        ) : (
          <Turnstile
            {...turnstileProps}
            options={{ size: "invisible", execution: "execute" }}
            style={{ display: "none" }}
          />
        ))}

      {(error || hasFieldErrors) && (
        <FormMessage
          message={{
            error: error ? (
              <>
                {error.endsWith(".") ? error : `${error}.`} If you think this
                might be wrong, please{" "}
                <EncodedEmailLink address={siteConfig.encodedEmail.support}>
                  email us
                </EncodedEmailLink>
                .
              </>
            ) : hasFieldErrors ? (
              "Please fix the above error and then try again."
            ) : (
              "Hmm, something went wrong. Please try again."
            ),
          }}
        />
      )}

      <Button
        type="submit"
        variant="primary"
        loading={isSubmitting || isWaitingForToken}
        loadingText={isWaitingForToken ? "Verifying..." : "Signing up..."}
        disabled={isSubmitting || isWaitingForToken}
      >
        Sign up
      </Button>
    </Form>
  );
}
