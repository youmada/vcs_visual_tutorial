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
  let innerModal = createModalContent(startModal.title, startModal.text, startModal.code);
  frame.appendChild(innerModal);
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("Modal-button-container");
  frame.appendChild(buttonContainer);
  // モーダルを切り替えるためのボタンを作成
  const nextButton = createButton("次へ", () => {
    currentModalIndex += 1;
    const nextModal = modals[currentModalIndex];
    if (nextModal) {
      // 既存のinnerModal要素を削除
      frame.removeChild(innerModal);
      // 新しいinnerModal要素を作成
      innerModal = createModalContent(nextModal.title, nextModal.text, nextModal.code);
      // 新しいinnerModal要素を追加
      frame.appendChild(innerModal);
      frame.appendChild(buttonContainer);
      buttonContainer.appendChild(backButton);
      if (currentModalIndex === modals.length - 1) {
        buttonContainer.removeChild(nextButton);
      } else {
        buttonContainer.appendChild(nextButton);
      }
    }
  });

  // 戻るボタンを作成
  const backButton = createButton("戻る", () => {
    currentModalIndex -= 1;
    const backModal = modals[currentModalIndex];
    if (backModal) {
      // 既存のinnerModal要素を削除
      frame.removeChild(innerModal);
      // 新しいinnerModal要素を作成
      innerModal = createModalContent(backModal.title, backModal.text, backModal.code);
      // 新しいinnerModal要素を追加
      frame.appendChild(innerModal);
      frame.appendChild(buttonContainer);
      if (currentModalIndex === 0) {
        buttonContainer.removeChild(backButton);
      } else {
        buttonContainer.appendChild(backButton);
      }
      buttonContainer.appendChild(nextButton);
    }
  });
  // モーダルが複数の時にボタンを表示する
  if (modals.length > 1) {
    buttonContainer.appendChild(nextButton);
    buttonContainer.appendChild(backButton);
    // 最初のモーダルのときは、戻るボタンを消す
    if (currentModalIndex === 0) {
      buttonContainer.removeChild(backButton);
    }
    // 最後のモーダルのときは次へボタンを消す
    if (currentModalIndex === modals.length - 1) {
      buttonContainer.removeChild(nextButton);
    }
  }

  // モーダルを閉じるボタンを作成
  const closeButton = document.createElement("button");
  closeButton.classList.add("modal-close-button");
  closeButton.textContent = "閉じる";
  closeButton.addEventListener("click", (e) => {
    e.preventDefault();
    document.body.removeChild(background);
  });

  frame.appendChild(closeButton);
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
