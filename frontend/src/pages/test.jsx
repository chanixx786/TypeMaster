import { Button } from "../components/ui/button";

export default function Test() {
  const durationOptions = [
    { id: 1, time: 60 },
    { id: 2, time: 180 },
    { id: 3, time: 300 },
  ];

  const stats = {
    wpm: 0,
    accuracy: 0,
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top Bar */}
      <section className="flex items-center justify-between p-4 mx-32">
        {/* Time */}
        <div className="flex gap-2">
          {durationOptions.map((option) => (
            <Button key={option.id}>
              {option.time}s
            </Button>
          ))}
        </div>

        {/* Statistics */}
        <div className="flex gap-6">
          {Object.entries(stats).map(([name, value]) => (
            <div
              key={name}className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-blue-500">
              <p>{name === "wpm" ? "WPM" : "Accuracy"}</p>
              <p>{value}</p>
            </div>
          ))}
        </div>

      </section>

      {/* Target Text */}
      <section className="flex flex-1 items-center justify-center">
        <h1>Test Page</h1>
      </section>

    </div>
  );
}