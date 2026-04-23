"use client";

import Form from "@/components/Form";
import Button from "@/components/Button";
import { styled } from "next-yak";

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
};

export default function RouteBoundaryState({
  message,
  onRetry,
  retryLabel,
}: RouteBoundaryStateProps) {
  return (
    <Form as="container">
      <Content>
        <p>{message}</p>
        {onRetry && retryLabel ? (
          <Button variant="secondary" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
      </Content>
    </Form>
  );
}
