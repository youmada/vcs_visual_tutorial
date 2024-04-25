export class Modal {
  private titleText: string;
  private codeBlock: string;
  private modalId: string;
  private innerText: string;
  callback: Function;

  constructor(titleText: string, codeBlock: string, modalId: string, innerText: string, callback: Function = () => {}) {
    this.titleText = titleText;
    this.codeBlock = codeBlock;
    this.modalId = modalId;
    this.innerText = innerText;
    this.callback = callback;
  }

  public get title(): string {
    return this.titleText;
  }

  public get code(): string {
    return this.codeBlock;
  }

  public get id(): string {
    return this.modalId;
  }

  public get text(): string {
    return this.innerText;
  }

  call(): Function {
    return this.callback();
  }
}
