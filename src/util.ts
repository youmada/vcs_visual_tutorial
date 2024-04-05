// 使用例:
// toggleElementVisibility("initPage", false); // initPageを非表示にする
// toggleElementVisibility("vcsPage", true); // vcsPageを表示する

export const toggleDisplay = (elementId: string, isVisible: boolean) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = isVisible ? "block" : "none";
  }
};
