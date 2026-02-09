export default function Home() {
  return (
    <>
      {
        [...Array(100)].map((_, i) => (
          <div key={i}>
            <h1 className="text-2xl font-bold mb-4">Home Feed</h1>
            <p className="text-gray-500">Main content will go here...</p>
          </div>
        ))
      }
    </>
  );
}