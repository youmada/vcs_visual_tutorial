export class Modal {
  private titleText: string;
  private codeBlock: string;
  private modalId: string;
  private innerText: string;

  constructor(titleText: string, codeBlock: string, modalId: string, innerText: string) {
    this.titleText = titleText;
    this.codeBlock = codeBlock;
    this.modalId = modalId;
    this.innerText = innerText;
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
}
