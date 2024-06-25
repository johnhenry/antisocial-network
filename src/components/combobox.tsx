import type { ChangeEventHandler, FC, ReactNode } from "react";

import { useState, useRef } from "react";

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

const ComboBox: FC<Props> = ({
  children,
  text = "›",
  defaultValue,
  className,
  onClick,
}) => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const [label, setLabel] = useState(defaultValue);
  const [title, setTitle] = useState(defaultValue);
  const selectChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    setTitle(event.target.selectedOptions[0].title);
    setLabel(event.target.value);
  };
  const sendSelected = () => {
    const selectEvent = new SelectEvent("select", label);
    onClick(selectEvent);
  };
  console.log({ title });
  return (
    <div className={className}>
      <select
        onChange={selectChange}
        defaultValue={defaultValue}
        placeholder=""
        noResultsText=""
        ref={selectRef}
        title={title}
      >
        {children}
      </select>
      <button type="button" onClick={sendSelected}>
        {text}
      </button>
    </div>
  );
};
export default ComboBox;
