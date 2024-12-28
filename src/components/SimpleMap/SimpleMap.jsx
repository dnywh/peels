export default function SimpleMap() {
  console.log("SimpleMap rendered", new Date().toISOString());
  return (
    <div
      style={{ width: "100%", height: "400px", backgroundColor: "lightblue" }}
    >
      SimpleMap
    </div>
  );
}
