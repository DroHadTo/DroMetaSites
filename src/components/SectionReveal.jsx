import React from "react";

export function SectionReveal({ children, className = "", delay = 0 }) {
  return (
    <div
      className={`${className} reveal-in`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}
