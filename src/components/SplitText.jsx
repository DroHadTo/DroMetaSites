export function SplitText({
  text,
  as: Tag = "h2",
  className = "",
  stagger = 0.035,
}) {
  const words = text.split(" ");

  return (
    <Tag className={className} aria-label={text}>
      <span className="sr-only">{text}</span>
      <span className="split-text" aria-hidden="true">
        {words.map((word, wordIndex) => (
          <span className="split-word" key={`${word}-${wordIndex}`}>
            {Array.from(word).map((char, index) => (
              <span
                className="split-char"
                key={`${word}-${wordIndex}-${index}`}
                style={{
                  animationDelay: `${(wordIndex * word.length + index) * stagger}s`,
                }}
              >
                {char}
              </span>
            ))}
          </span>
        ))}
      </span>
    </Tag>
  );
}
