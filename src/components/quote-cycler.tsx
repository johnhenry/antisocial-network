import type { FC, ComponentClass } from "react";
import React, { useState, useEffect, useCallback } from "react";
import { AI_SAYINGS } from "@/config/mod";
type PropsQuoteCycler = {
  sayings?: [string, string][];
  interval?: number;
  start?: number;
  random?: boolean;
  className?: string;
  Wrapper?: ComponentClass<any> | string;
};

const QuoteCycler: FC<PropsQuoteCycler> = ({
  sayings = AI_SAYINGS,
  interval = 5000,
  start = 0,
  random = false,
  Wrapper = "div",
  ...props
}) => {
  const [randomizedSayings, setRandomizedSayings] = useState(
    sayings.toSorted(() => Math.random() - 0.5)
  );
  const [index, setIndex] = useState(start);
  useEffect(() => {
    if (random) {
      const shuffled = [...sayings].sort(() => Math.random() - 0.5);
      setRandomizedSayings(shuffled);
    } else {
      setRandomizedSayings(sayings);
    }
    setIndex(0);
  }, [sayings, random]);

  const cycleQuote = useCallback(() => {
    if (randomizedSayings.length > 0) {
      if (random) {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * randomizedSayings.length);
        } while (newIndex === index && randomizedSayings.length > 1);
        setIndex(newIndex);
      } else {
        setIndex((prevIndex) => (prevIndex + 1) % randomizedSayings.length);
      }
    }
  }, [randomizedSayings, random, index]);

  useEffect(() => {
    if (randomizedSayings.length > 0) {
      const timer = setTimeout(cycleQuote, interval);
      return () => clearTimeout(timer);
    }
  }, [cycleQuote, interval, randomizedSayings]);

  const [quote, author] = randomizedSayings?.[index] || [];

  const body = !quote ? (
    <p>Loading...</p>
  ) : (
    <>
      <blockquote key={index}>{quote}</blockquote>
      <cite key={`author-${index}`}>{author}</cite>
    </>
  );

  return Wrapper ? <Wrapper {...props}>{body}</Wrapper> : body;
};

export default QuoteCycler;
