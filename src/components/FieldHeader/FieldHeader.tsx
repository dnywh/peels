import { styled } from "next-yak";

const FieldHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h1,
  p {
    text-wrap: balance;
  }
`;

export default FieldHeader;
