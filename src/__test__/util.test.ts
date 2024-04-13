/**
 * @jest-environment jsdom
 */
import { toggleDisplay, showModal, FormData } from "../util";
describe("toggleDisplay関数のテスト", () => {
  let document: Document;
  beforeEach(() => {
    document = window.document;
  });

  it("要素を表示する。", () => {
    // 要素生成
    const elementId = "testElement";
    const isVisible = true;
    const element = document.createElement("div");
    element.id = elementId;
    document.body.appendChild(element);

    // 実行
    toggleDisplay(elementId, isVisible);

    // 検証
    expect(element.style.display).toBe("block");

    // 要素の削除
    document.body.removeChild(element);
  });

  it("要素を非表示にする。", () => {
    // 要素生成
    const elementId = "testElement";
    const isVisible = false;
    const element = document.createElement("div");
    element.id = elementId;
    document.body.appendChild(element);

    // 実行
    toggleDisplay(elementId, isVisible);

    // 検証
    expect(element.style.display).toBe("none");

    // 要素の削除
    document.body.removeChild(element);
  });
});

describe("showModal関数のテスト", () => {
  let document: Document;
  beforeEach(() => {
    document = window.document;
  });
  it("モーダル要素を作成し、ドキュメントボディに追加する。", () => {
    // 準備
    const title = "テストモーダル";
    const innerContent = document.createElement("form");
    const formData: FormData<any> = {};
    const onSubmit = jest.fn();

    // 実行
    showModal(title, innerContent, formData, onSubmit);

    // 検証
    const modalBackground = document.querySelector(".modal-background");
    const modal = document.querySelector(".modal");
    const modalTitle = document.querySelector(".modal h2");

    expect(modalBackground).not.toBeNull();
    expect(modal).not.toBeNull();
    expect(modalTitle?.textContent).toBe(title);

    // 削除
    document.body.removeChild(modalBackground!);
  });

  it("フォームが送信された時にonSubmitコールバック関数が呼び出される。", () => {
    // 生成
    const title = "テストモーダル";
    const innerContent = document.createElement("form");
    const formData: FormData<any> = {};
    const onSubmit = jest.fn();
    const modalBackground = document.createElement("div");
    modalBackground.classList.add("modal-background");
    document.body.appendChild(modalBackground);

    // 実行
    showModal(title, innerContent, formData, onSubmit);
    innerContent.dispatchEvent(new Event("submit"));

    // 検証
    expect(onSubmit).toHaveBeenCalledWith(formData);

    // 削除
    document.body.removeChild(modalBackground);
  });
  it("モーダル要素をドキュメントボディから削除する。", () => {
    // 生成
    const title = "テストモーダル";
    const innerContent = document.createElement("form");
    const formData: FormData<any> = {};
    const onSubmit = jest.fn();
    // 実行
    showModal(title, innerContent, formData, onSubmit);
    const closeModal = document.querySelector(".modal-background")!;
    closeModal.dispatchEvent(new Event("click"));

    // 検証
    expect(document.querySelector(".modal-background")).toBeNull();
    expect(document.querySelector(".modal")).toBeNull();
  });
});
