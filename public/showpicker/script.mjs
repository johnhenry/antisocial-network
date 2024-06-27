(function () {
  if ("showPicker" in HTMLSelectElement.prototype) {
    // Browser already supports showPicker, no need for polyfill
    return;
  }

  const CUSTOM_PICKERS = new WeakMap();
  HTMLSelectElement.prototype.showPicker = function (event) {
    const select = this;

    const customPicker =
      CUSTOM_PICKERS.get(select) || document.createElement("div");
    CUSTOM_PICKERS.set(select, customPicker);
    customPicker.classList.add("custom-picker");
    customPicker.innerHTML = "";

    const remove = () => {
      customPicker.remove();
      document.removeEventListener("click", hidePicker);
      CUSTOM_PICKERS.delete(select);
    };

    // Populate custom picker with select options
    Array.from(select.options).forEach((option, index) => {
      // const div = option.cloneNode(true);
      const div = document.createElement("div");
      div.textContent = option.textContent;
      div.setAttribute("data-value", option.value);
      div.classList.add("option");
      if (select.options.selectedIndex === index) {
        div.classList.add("selected");
      } else {
        div.classList.remove("selected");
      }
      const selectOption = function () {
        const event = new Event("change", { bubbles: true });
        event.target = option;
        select.value = option.value;

        select.dispatchEvent(event);
        remove();
        div.removeEventListener("click", selectOption);
      };
      div.addEventListener("click", selectOption);
      customPicker.appendChild(div);
    });

    // Position the custom picker
    const rect = select.getBoundingClientRect();
    customPicker.style.top = `${rect.top + window.scrollY}px`;
    customPicker.style.left = `${rect.left + window.scrollX}px`;
    document.body.appendChild(customPicker);

    // Hide the picker when clicking outside
    function hidePicker(event) {
      if (!customPicker.contains(event.target) && event.target !== select) {
        remove();
      }
    }
    setTimeout(() => {
      document.addEventListener("click", hidePicker);
    });
  };
})();
