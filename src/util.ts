import { Modal } from "./class/modal";

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
 * 汎用ボタン関数
 * @param text - ボタンに表示するテキスト
 * @param onClick - ボタンがクリックされた時に実行される関数
 * @returns 作成されたボタン要素
 */

export const createButton = (text: string, onClick: () => void): HTMLButtonElement => {
  const button = document.createElement("button");
  button.classList.add("button");
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
};

/**
 * ユーザーに説明するためのモーダルを管理・操作する関数
 * @param modals - モーダルの情報を格納した配列
 *
 */
export const manageModals = (modals: Modal[]): void => {
  const startModal = modals[0];
  let currentModalIndex = 0;
  // モーダルのフレームを作成
  const background = createModalBackground();
  const frame = createModalFrame();
  // モーダルの中身を作成
  const innerModal = createModalContent(startModal.title, startModal.text, startModal.code);
  frame.appendChild(innerModal);
  // モーダルを切り替えるためのボタンを作成
  const nextButton = document.createElement("button");
  nextButton.textContent = "次へ";
  nextButton.addEventListener("click", (e) => {
    e.preventDefault();
    // 現在のモーダルを取得
    const currentModal = modals[currentModalIndex++];
    // 次のモーダルが存在する場合
    if (currentModal) {
      // 現在のモーダルを削除
      frame.removeChild(innerModal);
      // 次のモーダルを作成
      frame.appendChild(createModalContent(currentModal.title, currentModal.text, currentModal.code));
    } else {
      // 次のモーダルが存在しない場合はモーダルを閉じる
      document.body.removeChild(frame);
    }
  });

  // 戻るボタンを作成
  const backButton = document.createElement("button");
  backButton.textContent = "戻る";
  backButton.addEventListener("click", (e) => {
    e.preventDefault();
    // 現在のモーダルを取得
    const currentModal = modals[currentModalIndex--];
    // 前のモーダルが存在する場合
    if (currentModal) {
      // 現在のモーダルを削除
      frame.removeChild(innerModal);
      // 前のモーダルを作成
      frame.appendChild(createModalContent(currentModal.title, currentModal.text, currentModal.code));
    }
  });
  // モーダルが一つだけの場合は次へボタンを表示しない
  if (modals.length !== 1) {
    frame.appendChild(nextButton);
    frame.appendChild(backButton);
  }
  // 最後のモーダルになった時のモーダルを閉じるボタンを作成
  const closeButton = document.createElement("button");
  closeButton.classList.add("modal-close-button");
  closeButton.textContent = "閉じる";
  closeButton.addEventListener("click", (e) => {
    e.preventDefault();
    document.body.removeChild(background);
  });
  if (currentModalIndex === modals.length - 1) {
    frame.appendChild(closeButton);
  } else {
    if (closeButton.hasChildNodes()) {
      closeButton.removeChild(closeButton);
    }
  }
  background.appendChild(frame);
};

/**
 * モーダルのフレームを作成する関数。
 */

export const createModalFrame = (): HTMLDivElement => {
  // モーダル本体の要素を作成
  const modal = document.createElement("div");
  modal.classList.add("modal", "modal-frame");
  return modal;
};

/**
 * モーダルの背景を生成する関数。
 * @returns モーダルの背景要素
 */

export const createModalBackground = (): HTMLDivElement => {
  const modalBackground = document.createElement("div");
  modalBackground.classList.add("modal-background");
  document.body.appendChild(modalBackground);
  return modalBackground;
};

/**
 * モーダルの中身を作成する関数。
 * @param title - モーダルのタイトル
 * @param text - モーダルの中身となるテキスト
 * @param codeBlock - モーダルの中身となるコードブロック
 * @param modalFrame - モーダルのフレーム要素
 */

export const createModalContent = (title: string, text: string, codeBlock: string): HTMLElement => {
  const innerModal = document.createElement("div");
  const modalTitle = document.createElement("h2");
  modalTitle.textContent = title;
  const modalText = document.createElement("p");
  modalText.textContent = text;
  const modalCode = document.createElement("pre");
  modalCode.textContent = codeBlock;
  innerModal.appendChild(modalTitle);
  innerModal.appendChild(modalText);
  innerModal.appendChild(modalCode);
  return innerModal;
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
