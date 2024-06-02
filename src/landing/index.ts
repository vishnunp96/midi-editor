import { localized } from "../common/localize/localizedString"
import { dragDropInput, uploadInput } from "../common/file/input"

const localizeElement = (e: Element) => {
  const key = e.getAttribute("data-i18n")
  if (key !== null) {
    const text = localized(key, e.textContent ?? "")
    if (text !== undefined) {
      e.textContent = text
    }
  }
}

const localize = () => {
  document.querySelectorAll("*[data-i18n]").forEach(localizeElement)

  const title = document.getElementsByTagName("title")[0]
  if (title) {
    localizeElement(title)
  }
}

window.addEventListener("DOMContentLoaded", (e) => {

  const button = document.querySelector(".btn-hamburg") as HTMLDivElement;
  const slidingMenu = document.querySelector(".sliding-menu") as HTMLDivElement;
  button.addEventListener('click', function() {
    button.classList.toggle('active');
    button.classList.toggle('not-active');

    slidingMenu.classList.replace('hidden', 'out');
    slidingMenu.classList.toggle('in');
    slidingMenu.classList.toggle('out');
  });

  const volumeButton = document.querySelector(".speaker") as HTMLDivElement;
  volumeButton.addEventListener('click', function() {
    volumeButton.classList.toggle('mute')
  });



  const fileDrop = document.querySelector(".background-content") as HTMLDivElement;
  // fileDrop.addEventListener("drop", dragDropInput);
  fileDrop.addEventListener("dragleave", ev => ev.preventDefault());
  fileDrop.addEventListener("dragend", ev => ev.preventDefault());
  fileDrop.addEventListener("dragover", ev => ev.preventDefault());


  const fileInput = document.querySelector(".upload-input") as HTMLInputElement;
  // fileInput.addEventListener("change", uploadInput);

  console.log("DOM fully loaded and parsed")
  localize();
})
