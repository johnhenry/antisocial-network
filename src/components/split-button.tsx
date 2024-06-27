import type { ChangeEventHandler, FC, ReactNode } from "react";

import { useState, useRef, useEffect } from "react";

type Props = {
  children: ReactNode;
};

class SelectEvent extends Event {
  selected: string;
  constructor(type: string, selected: string) {
    super(type);
    this.selected = selected;
  }
}
class SelectedEvent extends Event {
  #target: HTMLElement | null;
  constructor(type: string = "selected", target: HTMLElement | null = null) {
    super(type);
    this.#target = target;
  }
  get target() {
    return this.#target;
  }
}

const SplitButton: FC<Props> = ({
  children,
  text = "▼",
  defaultValue,
  onClick,
}) => {
  const [option, setOption] = useState<HTMLOptionElement | null>(
    new SelectedEvent("select")
  );
  const select = useRef<HTMLSelectElement>(null);
  const selectChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    setOption(event.target.selectedOptions[0]);
  };
  const sendSelected = () => {
    if (option.target === null) {
      open();
    } else {
      onClick(new SelectedEvent("select", option));
    }
  };

  const open = () => {
    select.current.showPicker();
  };
  useEffect(() => {
    const get = async () => {
      const options = await select.current.options;
      const { selectedIndex } = options;
      if (!(selectedIndex > -1)) {
        return;
      }
      setOption(options[selectedIndex]);
      return () => {
        //cleanup
      };
    };
    get();
  }, []);

  return (
    <>
      <main>
        <select
          onChange={selectChange}
          defaultValue={defaultValue}
          ref={select}
        >
          {children}
        </select>
        <button type="button" title={option?.title} onClick={sendSelected}>
          {option?.label}
        </button>
      </main>
      <footer>
        {" "}
        <button type="button" onClick={open}>
          {text}
        </button>
      </footer>
    </>
  );
};
export default SplitButton;
