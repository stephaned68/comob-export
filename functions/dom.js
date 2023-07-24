/**
 * Create DOM element
 * @param {string} type
 * @param {string} content
 * @param {object} attributes
 * @returns {HTMLElement}
 */
const createElement = (type, content, attributes = {}) => {
  const element = document.createElement(type);
  for (const [attribute, value] of Object.entries(attributes)) {
    element.setAttribute(attribute, value);
  }
  if (content && content.length > 0) {
    if (content.charAt(0) === "<") element.innerText = content;
    else element.innerHTML = content;
  }
  return element;
};

export { createElement };

const clearContent = (container) => {
  while (container.childNodes.length > 0) {
    container.removeChild(container.childNodes[0]);
  }
};

export { clearContent };

function clearAlert(alert) {
  if (!alert) alert = document.querySelector("#alerts");
  clearContent(alert);
}

export function flash(message, color, timeout = 5) {
  const flashMessage = createElement("div", message, {
    class: `alert alert-${color} m-3 col-9 text-center`,
    role: "alert",
  });
  const alert = document.querySelector("#alerts");
  alert.appendChild(flashMessage);
  setTimeout(() => {
    clearAlert();
  }, timeout * 1000);
}
