import { useState, useEffect, useCallback } from "react";
import type { JSX } from "react";

export type Saying = [string, string][];

/**
 * Props for the QuoteCycler component.
 */
export interface QuoteCyclerProps {
  sayings: Saying;
  interval?: number;
  random?: boolean;
}

/**
 * A component that cycles through a list of quotes and authors.
 * @param {QuoteCyclerProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
const QuoteCycler = ({
  sayings = [],
  interval = 5000,
  random = false,
  ...props
}: QuoteCyclerProps): JSX.Element => {
  const [index, setIndex] = useState<number>(0);
  /**
   * Callback function to cycle to the next quote.
   */
  const cycleQuote = useCallback(() => {
    if (sayings.length > 0) {
      if (random) {
        let newIndex: number;
        do {
          newIndex = Math.floor(Math.random() * sayings.length);
        } while (newIndex === index && sayings.length > 1);
        setIndex(newIndex);
      } else {
        setIndex((prevIndex) => (prevIndex + 1) % sayings.length);
      }
    }
  }, [sayings, random, index]);

  useEffect(() => {
    if (sayings.length > 0) {
      const timer = setTimeout(cycleQuote, interval);
      return () => clearTimeout(timer);
    }
  }, [cycleQuote, interval, sayings, index, random]);

  if (!Array.isArray(sayings) || sayings.length === 0) {
    return (
      <div {...props}>
        <p>Loading...</p>
      </div>
    );
  }

  const [quote, author] = sayings[index];

  return (
    <div {...props}>
      <blockquote key={index}>{quote}</blockquote>
      <cite key={`author-${index}`}>{author}</cite>
    </div>
  );
};

export default QuoteCycler;
