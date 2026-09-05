"use client";

import Form from "@/components/Form";
import Button from "@/components/Button";
import { styled } from "next-yak";
import SupportErrorMessage from "@/components/SupportErrorMessage";
import type { SupportScope } from "@/lib/supportError";

const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`;

type RouteBoundaryStateProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  supportReference?: string;
  supportScope?: SupportScope;
};

export default function RouteBoundaryState({
  message,
  onRetry,
  retryLabel,
  supportReference,
  supportScope,
}: RouteBoundaryStateProps) {
  return (
    <Form as="container">
      <Content>
        <p>
          {supportScope ? (
            <SupportErrorMessage
              message={message}
              scope={supportScope}
              supportReference={supportReference}
            />
          ) : (
            message
          )}
        </p>
        {onRetry && retryLabel ? (
          <Button variant="secondary" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
      </Content>
    </Form>
  );
}
