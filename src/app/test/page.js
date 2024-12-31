import TestButton from "@/components/TestButton";

export default function Home() {
  return (
    <div>
      <h1>Welcome to Pigment CSS with Next.js</h1>
      {/* <TestButton size="large" variant="contained">
        A bigger contained button
      </TestButton>
      <TestButton size="small" variant="outlined">
        A smaller button
      </TestButton> */}
      <TestButton variant="contained" color="primary">
        Submit
      </TestButton>
    </div>
  );
}
