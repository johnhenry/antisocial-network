import type {
  ChangeEventHandler,
  FC,
  ReactNode,
  EventHandler,
  SyntheticEvent,
  ChangeEvent,
} from "react";

import { useState, useRef, useEffect } from "react";

type Props = {
  children: ReactNode;
  text: string;
  defaultValue: string;
  onClick: EventHandler<SyntheticEvent>;
};

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
  const [option, setOption] = useState<SelectedEvent | null>(
    new SelectedEvent("select")
  );
  const select = useRef<HTMLSelectElement>(null);
  const selectChange: ChangeEventHandler<HTMLSelectElement> = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
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
          title="options"
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
        <button title="show" type="button" onClick={open}>
          {text}
        </button>
      </footer>
    </>
  );
};
export default SplitButton;
