/**
 * 指定された要素の表示/非表示を切り替える関数です。
 * @param elementId - 要素のID
 * @param isVisible - 表示する場合はtrue、非表示にする場合はfalse
 */
export const toggleDisplay = (elementId: string, isVisible: boolean) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = isVisible ? "block" : "none";
  }
};

/**
 * モーダルを表示する関数です。
 * @param title - モーダルのタイトル
 * @param innerContent - モーダルの中身となる要素。フォーム要素を想定
 * @param formData - フォームデータの型定義
 * @param onSubmit - フォームが送信された時に実行されるコールバック関数
 */
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

/**
 * フォームデータの型定義です。
 */
export type FormData<T> = {
  [P in keyof T]?: string;
};
