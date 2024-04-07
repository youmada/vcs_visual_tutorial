// 使用例:
// toggleElementVisibility("initPage", false); // initPageを非表示にする
// toggleElementVisibility("vcsPage", true); // vcsPageを表示する

export const toggleDisplay = (elementId: string, isVisible: boolean) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = isVisible ? "block" : "none";
  }
};

export const showModal = <T>(title: string, innerContent: HTMLElement, formData: FormData<T>, onSubmit: (formData: FormData<T>) => void) => {
  // モーダルの背景要素を作成
  const modalBackground = document.createElement("div");
  modalBackground.classList.add("modal-background");
  // モーダル本体の要素を作成
  const modal = document.createElement("div");
  modal.classList.add("modal");
  // タイトルを追加
  const modalTitle = document.createElement("h2");
  modalTitle.textContent = title;
  modal.appendChild(modalTitle);
  // フォーム要素を作成
  innerContent.addEventListener("submit", (event) => {
    // ページのリロードを防止
    event.preventDefault();
    // フォームデータを渡してコールバック関数を実行
    onSubmit(formData);
    closeModal();
  });
  // モーダルにフォームを追加
  modal.appendChild(innerContent);
  modalBackground.appendChild(modal);
  document.body.appendChild(modalBackground);
  // モーダルの背景をクリックしたときにモーダルを閉じる
  modalBackground.addEventListener("click", (event) => {
    if (event.target === modalBackground) {
      closeModal();
    }
  });
  const closeModal = () => {
    document.body.removeChild(modalBackground);
  };
};

export type FormData<T> = {
  [P in keyof T]?: string;
};
