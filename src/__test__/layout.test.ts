
import { Layout } from "../class/layout.ts";
import * as StagingAreaLayout from "../class/stagingAreaLayout.ts";
import * as WorkingAreaLayout from "../class/workingAreaLayout.ts";

describe("Layoutクラスのテスト", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    document.body.innerHTML = `
      <div id="initPage"></div>
      <div id="vcsPage"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("createVcsElementメソッドのテスト", () => {
    const text = "テスト要素";
    const className = "test-class";
    const element = Layout.createVcsElement(text, className);

    expect(element.textContent).toBe(text);
    expect(element.classList.contains(className)).toBe(true);
    expect(element instanceof HTMLDivElement).toBe(true);
  });

  it("initVCSPageメソッドのテスト", () => {
    const initPageDiv = document.getElementById("initPage");
    const vcsPageDiv = document.getElementById("vcsPage");

    Layout.initVCSPage();

    expect(initPageDiv?.style.display).toBe("none");
    expect(vcsPageDiv?.style.display).toBe("block");
  });

  it("initPageメソッドのテスト", () => {
    Layout.initPage();

    const initPageDiv = document.getElementById("initPage");
    const title = initPageDiv?.querySelector("h1");
    const subTitle = initPageDiv?.querySelector("p");
    const initButton = initPageDiv?.querySelector("button");

    expect(title?.textContent).toBe("VVT");
    expect(subTitle?.textContent).toBe("VCS Visual Tutorial");
    expect(initButton?.textContent).toBe("Init");
  });

  it("createVcsPageLayoutメソッドのテスト", () => {
    const vcsPageDiv = document.getElementById("vcsPage");
    // モック関数を作成
    const mockCreateStagingArea = vi.fn().mockReturnValue((Layout.staging = Layout.createVcsElement("Staging", "top")));
    const mockCreateWorkingArea = vi.fn().mockReturnValue((Layout.working = Layout.createVcsElement("Working", "bottom")));

    // モック関数を適用
    vi.spyOn(StagingAreaLayout.StagingAreaLayout, "createStagingArea").mockImplementation(mockCreateStagingArea);
    vi.spyOn(WorkingAreaLayout.WorkingAreaLayout, "createWorkingArea").mockImplementation(mockCreateWorkingArea);

    Layout.createVcsPageLayout();

    const container = vcsPageDiv?.querySelector(".container");
    const leftContainer = container?.querySelector(".left");
    const repository = leftContainer?.querySelector(".vcs-content");
    const rightContainer = container?.querySelector(".right");
    const staging = rightContainer?.querySelector(".top");
    const working = rightContainer?.querySelector(".bottom");

    expect(container).toBeTruthy();
    expect(leftContainer).toBeTruthy();
    expect(repository).toBeTruthy();
    expect(rightContainer).toBeTruthy();
    expect(staging).toBeTruthy();
    expect(working).toBeTruthy();
  });

  it("updateVcsPageメソッドのテスト", () => {
    // モック関数を作成
    const mockCreateStagingArea = vi.fn().mockReturnValue(document.createElement("div"));
    const mockCreateWorkingArea = vi.fn().mockReturnValue(document.createElement("div"));

    // モック関数を適用
    vi.spyOn(StagingAreaLayout.StagingAreaLayout, "createStagingArea").mockImplementation(mockCreateStagingArea);
    vi.spyOn(WorkingAreaLayout.WorkingAreaLayout, "createWorkingArea").mockImplementation(mockCreateWorkingArea);
    Layout.updateVcsPage();

    // モック関数が呼び出されたことを確認
    expect(mockCreateStagingArea).toHaveBeenCalled();
    expect(mockCreateWorkingArea).toHaveBeenCalled();

    // VCSページが更新されたことを確認
    expect(document.getElementById("vcsPage")?.children.length).toBe(1);
  });
});
