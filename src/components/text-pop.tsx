import type { ChangeEventHandler, FC, RefObject, LegacyRef } from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { getAllAgentNames } from "@/lib/database/mod";
import * as TOOLS from "@/tools/mod";

const defaultTheme = {
  textarea: "w-full p-2 border border-gray-300 rounded",
  popup:
    "bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto",
  option: "px-4 py-2 cursor-pointer flex items-center",
  optionSelected: "bg-blue-100",
  optionHover: "hover:bg-gray-100",
  loadingText: "px-4 py-2 text-gray-500",
};

type Option = {
  id: number;
  name: string;
  avatar?: string;
  symbol?: string;
};

type Trigger = {
  pattern: RegExp;
  fetchOptions: (search: string) => Promise<Option[]> | Option[];
  color: string;
};

const DEFAULT_TRIGGERS: Record<string, Trigger> = {
  "@": {
    pattern: /(?:^|\s)@([\w-:]*)$/,
    fetchOptions: async (search) => {
      const names = await getAllAgentNames();
      return names
        .filter((name) => {
          return name.toLowerCase().includes(search.toLowerCase());
        })
        .map((name, index) => ({
          id: index,
          name,
          avatar: "",
        }));
    },
    color: "#4a5568",
  },
  "#": {
    pattern: /(?:^|\s)#([\w-]*)$/,
    fetchOptions: (search) => {
      const tags = Object.keys(TOOLS).map((name, id) => ({
        id,
        name,
      }));
      return tags.filter((tag) =>
        tag.name.toLowerCase().includes(search.toLowerCase())
      );
    },
    color: "#48bb78",
  },
  "::": {
    pattern: /(?:^|\s)::([\w-]*)$/,
    fetchOptions: async (search) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const emojis = [
        { id: 1, name: "smile", symbol: "😊" },
        { id: 2, name: "heart", symbol: "❤️" },
        { id: 3, name: "thumbsup", symbol: "👍" },
      ];
      return emojis.filter((emoji) =>
        emoji.name.toLowerCase().includes(search.toLowerCase())
      );
    },
    color: "#ed8936",
  },
};

type Props = {
  triggers?: Record<string, Trigger>;
  className?: string;
  placeholder?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  ref: RefObject<HTMLTextAreaElement>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  value: string;
  setValue: (value: string) => void;
};

const TextareaWithPopup: FC<Props> = ({
  triggers = DEFAULT_TRIGGERS,
  onChange,
  onKeyDown,
  ref: editorRef,
  value: editorValue,
  setValue: setEditorValue,
  ...props
}) => {
  const [activePopups, setActivePopups] = useState<
    Record<
      string,
      {
        search: string;
        position: { top: number; left: number };
        visible: boolean;
        loading: boolean;
        options: Option[];
        selectedIndex: number;
      }
    >
  >({});
  const [history, setHistory] = useState<
    { value: string; cursorPosition: number }[]
  >([{ value: "", cursorPosition: 0 }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const popupRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      for (const trigger in popupRefs.current) {
        if (
          popupRefs.current[trigger] &&
          !popupRefs.current[trigger].contains(event.target as Node)
        ) {
          setActivePopups((prev) => ({
            ...prev,
            [trigger]: { ...prev[trigger], visible: false },
          }));
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getCaretCoordinates = () => {
    const textarea = editorRef.current!;
    const caretPosition = textarea.selectionStart;
    const textBeforeCaret = textarea.value.slice(0, caretPosition);
    const lines = textBeforeCaret.split("\n");
    const currentLineIndex = lines.length - 1;
    const currentLineLength = lines[currentLineIndex].length;

    const dummyElement = document.createElement("div");
    dummyElement.style.position = "absolute";
    dummyElement.style.visibility = "hidden";
    dummyElement.style.whiteSpace = "pre-wrap";
    dummyElement.style.wordWrap = "break-word";
    dummyElement.style.width = `${textarea.clientWidth}px`;
    dummyElement.style.font = window.getComputedStyle(textarea).font;
    dummyElement.style.padding = window.getComputedStyle(textarea).padding;

    dummyElement.textContent = textBeforeCaret;
    document.body.appendChild(dummyElement);

    const caretRect = dummyElement.getBoundingClientRect();
    document.body.removeChild(dummyElement);

    const textareaRect = textarea.getBoundingClientRect();
    return {
      top: caretRect.height + window.scrollY,
      left: currentLineLength * 8 + window.scrollX,
    };
  };

  const handleInput = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;

    setEditorValue(newValue);
    addToHistory(newValue, cursorPosition);

    const textBeforeCursor = newValue.slice(0, cursorPosition);

    const newActivePopups: Record<
      string,
      {
        search: string;
        position: { top: number; left: number };
        visible: boolean;
        loading: boolean;
        options: Option[];
        selectedIndex: number;
      }
    > = { ...activePopups };

    for (const [triggerChar, triggerConfig] of Object.entries(triggers)) {
      const match = textBeforeCursor.match(triggerConfig.pattern);
      if (match) {
        const search = match[1] || "";
        const { top, left } = getCaretCoordinates();
        newActivePopups[triggerChar] = {
          search,
          position: { top, left },
          visible: true,
          loading: true,
          options: [],
          selectedIndex: 0,
        };
      } else if (newActivePopups[triggerChar]) {
        newActivePopups[triggerChar].visible = false;
      }
    }

    setActivePopups(newActivePopups);

    for (const [triggerChar, popup] of Object.entries(newActivePopups)) {
      if (popup.visible && popup.loading) {
        const options = await triggers[triggerChar].fetchOptions(popup.search);
        setActivePopups((prev) => ({
          ...prev,
          [triggerChar]: { ...prev[triggerChar], loading: false, options },
        }));
      }
    }
    onChange && onChange(e);
  };

  const handleOptionClick = (triggerChar: string, option: Option) => {
    insertOption(triggerChar, option);
  };

  const insertOption = (triggerChar: string, option: Option) => {
    const cursorPosition = editorRef.current!.selectionStart;
    const textBeforeCursor = editorValue.slice(0, cursorPosition);
    const textAfterCursor = editorValue.slice(cursorPosition);
    const match = textBeforeCursor.match(triggers[triggerChar].pattern);
    if (!match) return;

    const triggerStartIndex = match.index!;
    // const triggerEndIndex = triggerStartIndex + match[0].length;
    const insertText = option.symbol || option.name;

    // Preserve any space before the trigger
    const preservedSpace = match[0].startsWith(" ") ? " " : "";

    const newValue =
      textBeforeCursor.slice(0, triggerStartIndex) +
      preservedSpace +
      triggerChar +
      insertText +
      " " +
      textAfterCursor.slice(cursorPosition - triggerStartIndex);

    const newCursorPosition =
      triggerStartIndex +
      preservedSpace.length +
      triggerChar.length +
      insertText.length +
      1;

    setEditorValue(newValue);
    addToHistory(newValue, newCursorPosition);

    setActivePopups((prev) => ({
      ...prev,
      [triggerChar]: { ...prev[triggerChar], visible: false },
    }));

    editorRef.current?.focus();

    setTimeout(() => {
      editorRef.current!.selectionStart = editorRef.current!.selectionEnd =
        cursorPosition;
    }, 0);
  };

  const addToHistory = (value: string, cursorPosition: number) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ value, cursorPosition });
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  };

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const { value, cursorPosition } = history[newIndex];
      setEditorValue(value);
      setHistoryIndex(newIndex);
      setTimeout(() => {
        editorRef.current!.selectionStart = editorRef.current!.selectionEnd =
          cursorPosition;
      }, 0);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const { value, cursorPosition } = history[newIndex];
      setEditorValue(value);
      setHistoryIndex(newIndex);
      setTimeout(() => {
        editorRef.current!.selectionStart = editorRef.current!.selectionEnd =
          cursorPosition;
      }, 0);
    }
  }, [history, historyIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown && onKeyDown(e);
    if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }
    if (e.key === "y" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      redo();
      return;
    }

    for (const [triggerChar, popup] of Object.entries(activePopups)) {
      if (popup.visible) {
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setActivePopups((prev) => ({
              ...prev,
              [triggerChar]: {
                ...prev[triggerChar],
                selectedIndex:
                  (prev[triggerChar].selectedIndex + 1) %
                  prev[triggerChar].options.length,
              },
            }));
            break;
          case "ArrowUp":
            e.preventDefault();
            setActivePopups((prev) => ({
              ...prev,
              [triggerChar]: {
                ...prev[triggerChar],
                selectedIndex:
                  (prev[triggerChar].selectedIndex -
                    1 +
                    prev[triggerChar].options.length) %
                  prev[triggerChar].options.length,
              },
            }));
            break;
          case "Enter":
            e.preventDefault();
            if (popup.options[popup.selectedIndex]) {
              insertOption(triggerChar, popup.options[popup.selectedIndex]);
            }
            break;
          case "Escape":
            setActivePopups((prev) => ({
              ...prev,
              [triggerChar]: { ...prev[triggerChar], visible: false },
            }));
            break;
          default:
            break;
        }
      }
    }
  };

  type RenderOptionOptions = {
    triggerChar: string;
    option: Option;
    role?: string;
    selected?: boolean;
  };

  const renderOption: FC<RenderOptionOptions> = ({
    triggerChar,
    option,
    role,
    selected,
  }) => {
    return (
      <div
        title="Popup"
        aria-label="Popup"
        key={option.id}
        className={`option ${selected ? "selected" : ""}`}
        onClick={() => handleOptionClick(triggerChar, option)}
        role={role}
        aria-selected={selected}
      >
        {option.avatar && <span className="avatar">{option.avatar}</span>}
        {option.symbol && <span className="symbol">{option.symbol}</span>}
        <span>{option.name}</span>
      </div>
    );
  };

  return (
    <>
      <textarea
        ref={editorRef}
        value={editorValue}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        aria-autocomplete="list"
        {...props}
      />
      {Object.entries(activePopups).map(
        ([triggerChar, popup]) =>
          popup.visible && (
            <div
              key={triggerChar}
              ref={
                ((el: HTMLDivElement) =>
                  (popupRefs.current[triggerChar] =
                    el)) as unknown as LegacyRef<HTMLDivElement>
              }
              className="popup"
              style={{
                top: popup.position.top,
                left: popup.position.left,
                borderColor: triggers[triggerChar].color,
                position: "absolute",
              }}
              role="listbox"
            >
              {popup.loading ? (
                <div className="loading">Loading...</div>
              ) : (
                popup.options.map((option, index) =>
                  renderOption({
                    triggerChar,
                    option,
                    selected: popup.selectedIndex === index,
                    role: "option",
                  })
                )
              )}
            </div>
          )
      )}
    </>
  );
};

export default TextareaWithPopup;
