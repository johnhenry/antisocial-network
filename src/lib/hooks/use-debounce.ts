// https://stackoverflow.com/questions/54666401/how-to-use-throttle-or-debounce-with-react-hook
import { useEffect } from "react";

const useDebouncedEffect = (effect: Function, deps: any[], delay: number) => {
  useEffect(
    (...args) => {
      let cleanup: any;
      const handler = setTimeout(
        (...args) => {
          cleanup = effect(...args);
        },
        delay,
        ...args,
      );

      return () => {
        clearTimeout(handler);
        if (typeof cleanup === "function") {
          cleanup();
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [...(deps || []), delay],
  );
};

export default useDebouncedEffect;
