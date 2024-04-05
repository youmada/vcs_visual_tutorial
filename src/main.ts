import { toggleDisplay } from "./util";

function initProcess() {
  // Create init button
  const initButton = document.createElement("button");
  initButton.textContent = "Init";
  initButton.addEventListener("click", showVcsPage);
  initButton.style.display = "block";
  initButton.style.margin = "auto";

  // Create h1 tag
  const title = document.createElement("h1");
  title.textContent = "VVT";
  title.style.textAlign = "center";

  // Create p tag
  const subTitle = document.createElement("p");
  subTitle.textContent = "VCS Visual Tutorial";
  subTitle.style.textAlign = "center";

  // Append elements to initPage div
  const initPageDiv = document.getElementById("initPage");
  if (initPageDiv) {
    initPageDiv.appendChild(title);
    initPageDiv.appendChild(subTitle);
    initPageDiv.appendChild(initButton);
  }

  function showVcsPage() {
    const initPageDiv = document.getElementById("initPage");
    const vcsPageDiv = document.getElementById("vcsPage");
    if (initPageDiv && vcsPageDiv) {
      toggleDisplay("initPage", false);
      toggleDisplay("vcsPage", true);
    }
  }
}

function createVcsPageLayout() {
  // Create repository, staging, and working elements
  const repository = document.createElement("div");
  repository.textContent = "Repository";
  repository.classList.add("left");

  const staging = document.createElement("div");
  staging.textContent = "Staging";
  staging.classList.add("top");

  const working = document.createElement("div");
  working.textContent = "Working";
  working.classList.add("bottom");

  // Create container to wrap left and right elements
  const container = document.createElement("div");
  container.classList.add("container");

  const rightContainer = document.createElement("div");
  rightContainer.classList.add("right");

  // Append elements to vcsPage div
  const vcsPageDiv = document.getElementById("vcsPage");
  if (vcsPageDiv) {
    vcsPageDiv.innerHTML = ""; // Clear previous content

    container.appendChild(repository);
    container.appendChild(rightContainer);
    rightContainer.appendChild(staging);
    rightContainer.appendChild(working);

    vcsPageDiv.appendChild(container);
  }
}
// Call createVcsPageLayout function when the page is loaded
document.addEventListener("DOMContentLoaded", createVcsPageLayout);

// Call initProcess function when the page is loaded
document.addEventListener("DOMContentLoaded", initProcess);
