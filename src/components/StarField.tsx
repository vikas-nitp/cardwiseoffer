const STARS = Array.from({ length: 56 }, (_, i) => {
  const s = (i + 1) * 7919;
  return {
    id: i,
    x: ((s * 1337) % 10000) / 100,
    y: ((s * 9001) % 10000) / 100,
    size: (((s * 3) % 15) + 5) / 10,
    delay: ((s * 13) % 8000) / 1000,
    cls: ["star-a", "star-b", "star-c"][i % 3],
  };
});

const StarField = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
    {STARS.map(({ id, x, y, size, delay, cls }) => (
      <span
        key={id}
        className={cls}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          background: "hsl(218 54% 94%)",
          animationDelay: `${delay}s`,
        }}
      />
    ))}
  </div>
);

export default StarField;
