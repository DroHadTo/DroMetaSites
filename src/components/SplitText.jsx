import { motion } from "framer-motion";

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
      <motion.span
        className="split-text"
        aria-hidden="true"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
        variants={{
          visible: {
            transition: {
              staggerChildren: stagger,
            },
          },
        }}
      >
        {words.map((word) => (
          <span className="split-word" key={word}>
            {Array.from(word).map((char, index) => (
              <motion.span
                className="split-char"
                key={`${word}-${index}`}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: "0.8em",
                    filter: "blur(12px)",
                  },
                  visible: {
                    opacity: 1,
                    y: "0em",
                    filter: "blur(0px)",
                    transition: {
                      duration: 0.55,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  },
                }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
