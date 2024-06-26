// https://designcode.io/react-hooks-handbook-uselocalstorage-hook\
// https://www.geeksforgeeks.org/reactjs-uselocalstorage-custom-hook/
import { useState, useEffect } from "react";
const useLocalStorage = <T>(
  name: string,
  defaultValue: T
): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(defaultValue);
  useEffect(() => {
    const storageListener = (event: StorageEvent) => {
      if (event.key === name) {
        setValue(JSON.parse(event.newValue as string));
      }
    };
    const load = () => {
      const storedValue = localStorage.getItem(name);
      setValue(JSON.parse(storedValue as string));
      window.addEventListener("storage", storageListener);
    };
    load();

    return () => {
      window.removeEventListener("storage", storageListener);
    };
  }, [name]);
  const setStoredValue = (value: T) => {
    setValue(value);
    localStorage.setItem(name, JSON.stringify(value));
  };
  return [value, setStoredValue];
};

export default useLocalStorage;
