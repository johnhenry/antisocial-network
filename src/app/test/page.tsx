// "use client";
// import type {
//   FC,
//   ChangeEvent,
//   KeyboardEvent,
//   MouseEvent,
//   TouchEvent,
//   CSSProperties,
//   ReactElement,
//   RefObject,
//   MouseEventHandler,
// } from "react";
// import React, { useState, useRef, useEffect, useCallback } from "react";

// interface Theme {
//   textarea?: string;
//   popup?: string;
//   option?: string;
//   optionSelected?: string;
//   optionHover?: string;
//   loadingText?: string;
// }

// interface Trigger {
//   pattern: RegExp;
//   fetchOptions: (search: string) => Promise<Option[]>;
//   color: string;
//   preserveLeadingCharacters: boolean;
// }

// interface Option {
//   id: number;
//   name: string;
//   avatar?: string;
// }

// interface ActivePopup {
//   color: string;
//   search: string;
//   position: { top: number; left: number };
//   visible: boolean;
//   loading: boolean;
//   options: Option[];
//   selectedIndex: number;
// }

// interface Triggers {
//   [key: string]: Trigger;
// }

// interface TextareaWithPopupProps {
//   triggers?: Triggers;
//   theme?: Theme;
// }

// interface HistoryItem {
//   value: string;
//   cursorPosition: number;
// }

// const defaultTheme: Theme = {
//   textarea: "w-full p-2 border border-gray-300 rounded",
//   popup:
//     "bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto",
//   option: "px-4 py-2 cursor-pointer flex items-center",
//   optionSelected: "bg-blue-100",
//   optionHover: "hover:bg-gray-100",
//   loadingText: "px-4 py-2 text-gray-500",
// };

// const TextareaWithPopup: FC<TextareaWithPopupProps> = ({
//   triggers = {
//     "@": {
//       pattern: /(?:^|\s)@([\w-:]*)$/,
//       fetchOptions: async (search) => {
//         await new Promise((resolve) => setTimeout(resolve, 300));
//         const users: Option[] = [
//           { id: 1, name: "John-Doe", avatar: "JD" },
//           { id: 2, name: "Jane:Smith", avatar: "JS" },
//           { id: 3, name: "Alice-Johnson", avatar: "AJ" },
//         ];
//         return users.filter((user) =>
//           user.name.toLowerCase().includes(search.toLowerCase())
//         );
//       },
//       color: "#4a5568",
//       preserveLeadingCharacters: false,
//     },
//     "#": {
//       pattern: /(?:^|\s)#([\w-:]*)$/,
//       fetchOptions: async (search) => {
//         await new Promise((resolve) => setTimeout(resolve, 300));
//         const tags: Option[] = [
//           { id: 1, name: "javascript-es6" },
//           { id: 2, name: "react:hooks" },
//           { id: 3, name: "node:express" },
//         ];
//         return tags.filter((tag) =>
//           tag.name.toLowerCase().includes(search.toLowerCase())
//         );
//       },
//       color: "#48bb78",
//       preserveLeadingCharacters: true,
//     },
//   },
//   theme = {},
// }) => {
//   const [editorValue, setEditorValue] = useState<string>("");
//   const [activePopups, setActivePopups] = useState<{
//     [key: string]: ActivePopup;
//   }>({});
//   const [history, setHistory] = useState<HistoryItem[]>([
//     { value: "", cursorPosition: 0 },
//   ]);
//   const [historyIndex, setHistoryIndex] = useState<number>(0);
//   const [isMobile, setIsMobile] = useState<boolean>(false);
//   const editorRef: RefObject<HTMLTextAreaElement> =
//     useRef<HTMLTextAreaElement>(null);
//   const popupRefs: RefObject<{ [key: string]: HTMLDivElement }> = useRef<{
//     [key: string]: HTMLDivElement;
//   }>({});

//   const mergedTheme: Theme = { ...defaultTheme, ...theme };

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };

//     handleResize();
//     window.addEventListener("resize", handleResize);

//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     const handleClickOutside: MouseEventHandler = (
//       event: MouseEvent | TouchEvent
//     ) => {
//       for (const trigger in popupRefs.current) {
//         if (
//           popupRefs.current[trigger] &&
//           !popupRefs.current[trigger].contains(event.target as Node)
//         ) {
//           setActivePopups((prev) => ({
//             ...prev,
//             [trigger]: { ...prev[trigger], visible: false },
//           }));
//         }
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     document.addEventListener("touchstart", handleClickOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.removeEventListener("touchstart", handleClickOutside);
//     };
//   }, []);

//   const getCaretCoordinates = (): { top: number; left: number } => {
//     const textarea = editorRef.current;
//     const caretPosition = textarea!.selectionStart;
//     const textBeforeCaret = textarea!.value.slice(0, caretPosition);
//     const lines = textBeforeCaret.split("\n");
//     const currentLineIndex = lines.length - 1;
//     const currentLineLength = lines[currentLineIndex].length;

//     const dummyElement = document.createElement("div");
//     dummyElement.style.position = "absolute";
//     dummyElement.style.visibility = "hidden";
//     dummyElement.style.whiteSpace = "pre-wrap";
//     dummyElement.style.wordWrap = "break-word";
//     dummyElement.style.width = `${textarea!.clientWidth}px`;
//     dummyElement.style.font = window.getComputedStyle(textarea!).font;
//     dummyElement.style.padding = window.getComputedStyle(textarea!).padding;

//     dummyElement.textContent = textBeforeCaret;
//     document.body.appendChild(dummyElement);

//     const caretRect = dummyElement.getBoundingClientRect();
//     document.body.removeChild(dummyElement);

//     const textareaRect = textarea!.getBoundingClientRect();
//     return {
//       top: textareaRect.top + caretRect.height + window.scrollY,
//       left: textareaRect.left + currentLineLength * 8 + window.scrollX,
//     };
//   };

//   const handleInput = async (e: ChangeEvent<HTMLTextAreaElement>) => {
//     const newValue = e.target.value;
//     const cursorPosition = e.target.selectionStart;

//     setEditorValue(newValue);
//     addToHistory(newValue, cursorPosition);

//     const textBeforeCursor = newValue.slice(0, cursorPosition);

//     const newActivePopups: { [key: string]: ActivePopup } = { ...activePopups };

//     for (const [trigger, { pattern, fetchOptions, color }] of Object.entries(
//       triggers
//     )) {
//       const match = textBeforeCursor.match(pattern);
//       if (match) {
//         const search = match[1] || "";
//         const { top, left } = getCaretCoordinates();
//         newActivePopups[trigger] = {
//           color,
//           search,
//           position: { top, left },
//           visible: true,
//           loading: true,
//           options: [],
//           selectedIndex: 0,
//         };
//       } else if (newActivePopups[trigger]) {
//         newActivePopups[trigger].visible = false;
//       }
//     }

//     setActivePopups(newActivePopups);

//     for (const [trigger, popup] of Object.entries(newActivePopups)) {
//       if (popup.visible && popup.loading) {
//         const options = await triggers[trigger].fetchOptions(popup.search);
//         setActivePopups((prev) => ({
//           ...prev,
//           [trigger]: { ...prev[trigger], loading: false, options },
//         }));
//       }
//     }
//   };

//   const handleOptionClick = (trigger: string, option: Option) => {
//     insertOption(trigger, option);
//   };

//   const insertOption = (trigger: string, option: Option) => {
//     const cursorPosition = editorRef.current.selectionStart;
//     const textBeforeCursor = editorValue.slice(0, cursorPosition);
//     const textAfterCursor = editorValue.slice(cursorPosition);
//     const match = textBeforeCursor.match(triggers[trigger].pattern);
//     if (!match) return;

//     const triggerIndex = match.index;
//     const insertText = option.name;
//     let newValue: string;
//     let newCursorPosition: number;

//     const textBeforeTrigger = textBeforeCursor.slice(0, triggerIndex);
//     const hasSpaceBefore = /\s$/.test(textBeforeTrigger);

//     if (triggers[trigger].preserveLeadingCharacters) {
//       newValue =
//         textBeforeTrigger +
//         (hasSpaceBefore ? "" : " ") +
//         trigger +
//         insertText +
//         " " +
//         textAfterCursor;
//       newCursorPosition =
//         triggerIndex ||
//         0 + (hasSpaceBefore ? 0 : 1) + trigger.length + insertText.length + 1;
//     } else {
//       newValue =
//         textBeforeTrigger +
//         (hasSpaceBefore ? "" : " ") +
//         insertText +
//         " " +
//         textAfterCursor;
//       newCursorPosition =
//         triggerIndex || 0 + (hasSpaceBefore ? 0 : 1) + insertText.length + 1;
//     }

//     setEditorValue(newValue);
//     addToHistory(newValue, newCursorPosition);

//     setActivePopups((prev) => ({
//       ...prev,
//       [trigger]: { ...prev[trigger], visible: false },
//     }));
//     editorRef.current.focus();

//     setTimeout(() => {
//       editorRef.current.selectionStart = editorRef.current.selectionEnd =
//         newCursorPosition;
//     }, 0);
//   };

//   const addToHistory = (value: string, cursorPosition: number) => {
//     setHistory((prev) => {
//       const newHistory = prev.slice(0, historyIndex + 1);
//       newHistory.push({ value, cursorPosition });
//       return newHistory;
//     });
//     setHistoryIndex((prev) => prev + 1);
//   };

//   const undo = useCallback(() => {
//     if (historyIndex > 0) {
//       const newIndex = historyIndex - 1;
//       const { value, cursorPosition } = history[newIndex];
//       setEditorValue(value);
//       setHistoryIndex(newIndex);
//       setTimeout(() => {
//         editorRef.current.selectionStart = editorRef.current.selectionEnd =
//           cursorPosition;
//       }, 0);
//     }
//   }, [history, historyIndex]);

//   const redo = useCallback(() => {
//     if (historyIndex < history.length - 1) {
//       const newIndex = historyIndex + 1;
//       const { value, cursorPosition } = history[newIndex];
//       setEditorValue(value);
//       setHistoryIndex(newIndex);
//       setTimeout(() => {
//         editorRef.current.selectionStart = editorRef.current.selectionEnd =
//           cursorPosition;
//       }, 0);
//     }
//   }, [history, historyIndex]);

//   const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
//       if (e.shiftKey) {
//         e.preventDefault();
//         redo();
//       } else {
//         e.preventDefault();
//         undo();
//       }
//       return;
//     }
//     if (e.key === "y" && (e.ctrlKey || e.metaKey)) {
//       e.preventDefault();
//       redo();
//       return;
//     }

//     for (const [trigger, popup] of Object.entries(activePopups)) {
//       if (popup.visible) {
//         switch (e.key) {
//           case "ArrowDown":
//             e.preventDefault();
//             setActivePopups((prev) => ({
//               ...prev,
//               [trigger]: {
//                 ...prev[trigger],
//                 selectedIndex:
//                   (prev[trigger].selectedIndex + 1) %
//                   prev[trigger].options.length,
//               },
//             }));
//             break;
//           case "ArrowUp":
//             e.preventDefault();
//             setActivePopups((prev) => ({
//               ...prev,
//               [trigger]: {
//                 ...prev[trigger],
//                 selectedIndex:
//                   (prev[trigger].selectedIndex -
//                     1 +
//                     prev[trigger].options.length) %
//                   prev[trigger].options.length,
//               },
//             }));
//             break;
//           case "Enter":
//             e.preventDefault();
//             if (popup.options[popup.selectedIndex]) {
//               insertOption(trigger, popup.options[popup.selectedIndex]);
//             }
//             break;
//           case "Escape":
//             setActivePopups((prev) => ({
//               ...prev,
//               [trigger]: { ...prev[trigger], visible: false },
//             }));
//             break;
//           default:
//             break;
//         }
//       }
//     }
//   };

//   const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
//     const touch = e.touches[0];
//     const element = document.elementFromPoint(touch.clientX, touch.clientY);
//     if (element && element.getAttribute("role") === "option") {
//       element.click();
//     }
//   };

//   const renderOption = (
//     trigger: string,
//     option: Option,
//     index: number,
//     selectedIndex: number
//   ): ReactElement => {
//     const isSelected = index === selectedIndex;
//     return (
//       <div
//         key={option.id}
//         className={`${mergedTheme.option} ${
//           isSelected ? mergedTheme.optionSelected : mergedTheme.optionHover
//         }`}
//         onClick={() => handleOptionClick(trigger, option)}
//         role="option"
//         aria-selected={isSelected}
//       >
//         {option.avatar && (
//           <span className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
//             {option.avatar}
//           </span>
//         )}
//         <span>{option.name}</span>
//       </div>
//     );
//   };

//   return (
//     <div className="relative">
//       <textarea
//         ref={editorRef}
//         value={editorValue}
//         onChange={handleInput}
//         onKeyDown={handleKeyDown}
//         className={mergedTheme.textarea}
//         rows={5}
//         aria-autocomplete="list"
//       />
//       {Object.entries(activePopups).map(
//         ([trigger, popup]) =>
//           popup.visible && (
//             <div
//               key={trigger}
//               ref={(el) => (popupRefs.current[trigger] = el)}
//               className={mergedTheme.popup}
//               style={{
//                 top: popup.position.top,
//                 left: popup.position.left,
//                 borderColor: popup.color,
//                 ...(isMobile
//                   ? {
//                       position: "fixed",
//                       bottom: "0",
//                       left: "0",
//                       right: "0",
//                       top: "auto",
//                     }
//                   : {}),
//               }}
//               role="listbox"
//               onTouchStart={handleTouchStart}
//             >
//               {popup.loading ? (
//                 <div className={mergedTheme.loadingText}>Loading...</div>
//               ) : (
//                 popup.options.map((option, index) =>
//                   renderOption(trigger, option, index, popup.selectedIndex)
//                 )
//               )}
//             </div>
//           )
//       )}
//     </div>
//   );
// };

// const Page: FC = () => {
//   return <TextareaWithPopup />;
// };

// export default Page;
export default () => null;
