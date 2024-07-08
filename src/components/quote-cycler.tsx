import React, { useState, useEffect, useCallback } from "react";

const QuoteCycler = ({
  sayings = [],
  interval = 3000,
  random = false,
  ...props
}) => {
  const [randomizedSayings, setRandomizedSayings] = useState(sayings);
  const [index, setIndex] = useState(0);
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

  if (!Array.isArray(randomizedSayings) || randomizedSayings.length === 0) {
    return (
      <div {...props}>
        <p>Loading...</p>
      </div>
    );
  }

  const [quote, author] = randomizedSayings[index];

  return (
    <div {...props}>
      <blockquote key={index}>{quote}</blockquote>
      <cite key={`author-${index}`}>{author}</cite>
    </div>
  );
};

export default QuoteCycler;
