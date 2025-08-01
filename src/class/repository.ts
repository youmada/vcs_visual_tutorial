import { Index } from ".";
import { BlobFile } from "./blobFile.ts";
import { Commit } from "./commit.ts";
import { Contents } from "./contents.ts";
import { Folder } from "./folder.ts";
import { Tree } from "./tree.ts";

/**
 * リポジトリを表すクラスです。
 * @property index - Indexクラスのインスタンス
 * @property head - 現在のコミットのID
 * @property commitList - コミットのリスト
 * @property fileList - ファイルのリスト。これまで変更したBlobFileのリストが入る。
 * @property treeList - ツリーのリスト
 * @property branchList - ブランチのリスト
 * @property currentBranch - 現在のブランチ名
 */
export class Repository {
  index: Index;
  head: string | null;
  commitList: { [name: string]: Commit };
  fileList: { [name: string]: BlobFile };
  treeList: { [name: string]: Tree };
  branchList: { [name: string]: string };
  currentBranch: string;

  constructor() {
    this.index = new Index();
    this.head = null;
    this.commitList = {};
    this.fileList = {};
    this.treeList = {};
    this.branchList = {};
    this.currentBranch = "";
  }

  /**
   * Repositoryクラスのインスタンスを初期化します。
   * @returns Repositoryクラスのインスタンス
   */
  static init() {
    const repository = new Repository();
    return repository;
  }

  /**
   * ファイルをステージングエリアに追加する。ステージングエリアに同名のファイルがある場合は、上書きする。
   * @param files - ステージングエリアに追加するファイル Vcs.changedFilesの配列が入る
   */
  stage(files: BlobFile[]) {
    files.forEach((file) => {
      const stagedFiles = Object.entries(this.index.stagedFiles);
      for (const [key, stagedFile] of stagedFiles) {
        if (stagedFile.name === file.name) {
          delete this.index.stagedFiles[key];
        }
      }
      this.index.addStage(file);
    });
  }

  /**
   * ファイルをステージングエリアから削除する。
   */
  unstage(file: BlobFile) {
    this.index.removeStage(file);
  }

  /**
   * ステージングエリアをクリアする。
   */
  resetStage() {
    this.index.clearStage();
  }

  /**
   * 渡されたファイル配列をRepositoryクラスのfileListに追加する。
   * 追加する際に、参照を渡さないために、BlobFile.initを使って新しいインスタンスを生成する。
   * @param files - BlobFileの配列
   */
  async addFileList(files: BlobFile[]) {
    for (const file of files) {
      this.fileList[file.getId()] = await BlobFile.init(file.name, file.text, file.path);
    }
  }

  /**
   * ブランチを作成する。すでに同じブランチが存在する場合は作成しない。
   * @param name - 作成するブランチ名
   * @param id - ブランチを作成するコミットのID
   * @returns 作成したブランチの最新コミットのIDを返す。すでに同じ名前のブランチが存在する場合はメッセージを返す。
   */
  async createBranch(name: string, id: string): Promise<string | null> {
    if (!this.checkBranch(name)) {
      this.currentBranch = name;
      const parentCommit = this.commitList[id];
      const files: BlobFile[] = [];
      // ブランチを作成する際、親コミットのファイルをステージングする
      Object.values(parentCommit.tree.entry).forEach((content: BlobFile | Tree | Folder) => {
        if (content instanceof BlobFile) {
          files.push(content);
        }
      });
      this.stage(files);
      const head = await this.commit(`${name} branch created`);
      // 現在のブランチのhead以外から新しいブランチを作成する場合、新しいブランチのheadに親コミットのIDを設定する
      this.commitList[head].setParentCommitId(id);
      this.branchList[name] = head!;
      return head;
    } else return null;
  }

  /**
   * ブランチを作成する際に、同じ名前のブランチが存在するか確認する。
   * @param name - 確認するブランチ名
   * @returns 同じ名前のブランチが存在する場合はtrue、存在しない場合はfalseを返す。
   */
  checkBranch(name: string): boolean {
    return this.branchList[name] !== undefined;
  }

  /**
   * ブランチを検索する。
   * @param name - 検索するブランチ名
   * @returns ブランチが存在する場合はそのブランチの最新コミットのIDを返す。存在しない場合はnullを返す。
   */
  searchBranch(name: string) {
    if (this.checkBranch(name)) {
      return this.branchList[name];
    } else {
      return null;
    }
  }

  /**
   * ブランチ、コミットを切り替える
   * @param id - 切り替えるコミットのID
   * @returns 切り替えたブランチの名前を返す。存在しないブランチ名が渡された場合はnullを返す。
   */

  checkOut(id: string): string | null {
    if (this.commitList[id]) {
      this.head = id;
      this.currentBranch = this.commitList[id].getBranch();
      return this.currentBranch;
    } else return null;
  }

  /**
   * マージを行う。
   * マージ成功時、マージ先のブランチにHEADを移動する。
   * @param branchName - マージ先のブランチ名
   * @returns マージが成功した場合はコミットのIDを返す。失敗した場合はnullを返す。
   */
  async merge(branchName: string) {
    // マージ先の最新コミット
    const targetCommit = this.searchBranch(branchName);

    if (targetCommit == null) return null;
    // 現在のブランチの最新コミット
    const currentCommit = this.head!;

    // マージ先と元のブランチの共通している親コミットのID
    const baseCommit = this.findBaseCommit(targetCommit, currentCommit);

    if (baseCommit == null) return null;

    // 共通の親コミットを元に、マージ先と元のブランチの差分ファイルを取得
    const changeFiles = this.checkChangeFiles(targetCommit, currentCommit, baseCommit);
    // マージコミットのID
    let commitID;
    // 引数のブランチ名を現在のブランチに変更
    const currentBranch = this.currentBranch;
    this.currentBranch = branchName;
    if (changeFiles[1].length === 0) {
      // コンフリクトがない場合
      this.stage(changeFiles[0]);
      commitID = await this.commit(`merge ${currentBranch} to ${branchName}`);
    } else {
      // コンフリクトがある場合
      await this.resolveConflict(changeFiles[1], targetCommit, currentCommit);
      commitID = await this.commit(`merge ${currentBranch} to ${branchName}`);
    }
    // マージ先のコミットに親コミットを設定
    this.commitList[commitID].setSecondParentCommitId(targetCommit);
    // マージ先のブランチにHEADを移動
    this.checkOut(commitID);
    return commitID;
  }

  /**
   * コンフリクトを解決する。
   * @param files - コンフリクトしているファイルの配列
   * @param targetCommitID - マージ先のコミットID
   * @param currentCommitID - 現在のコミットID
   */
  async resolveConflict(files: BlobFile[], targetCommitID: string, currentCommitID: string): Promise<void> {
    // filesには配列でオブジェクトが入っている
    // ユーザーに選択肢を表示し、選択されたファイルをステージングする
    for (const file of files) {
      const choice = await new Promise<string | null>((resolve) => {
        resolve(
          prompt(
            `コンフリクトが発生しています。target(マージ先)/current(マージ元)のどちらのファイルをコミットしますか？ ファイル名:${file.name}? (target/current)`
          )
        );
      });
      if (choice === null) return alert("targetかcurrentを入力してください。");

      if (choice === "target") {
        const targetFile = this.commitList[targetCommitID].tree.findFile(file.name);
        if (targetFile === null) return alert("予期せぬエラーが発生しました。");
        this.stage([targetFile]);
      } else if (choice === "current") {
        const currentFile = this.commitList[currentCommitID].tree.findFile(file.name);
        if (currentFile === null) return alert("予期せぬエラーが発生しました。");
        this.stage([currentFile]);
      }
    }
  }

  /**
   * ファイルの変更とコンフリクトを検出する。
   * @param target - マージ先のコミットID
   * @param current - 現在のコミットID
   * @param base - 共通の親コミットID
   * @returns ファイルの変更とコンフリクトを返す。[変更ファイル, コンフリクトファイル]
   */
  checkChangeFiles(target: string, current: string, base: string): [BlobFile[], BlobFile[]] {
    // 変更ファイルとコンフリクトファイルを格納する配列
    const changeFiles: BlobFile[] = [];
    const conflictFiles: BlobFile[] = [];

    // 共通親コミット、マージ先、現在のコミットオブジェクトを取得
    const baseCommit = this.commitList[base];
    const targetCommit = this.commitList[target];
    const currentCommit = this.commitList[current];

    const serachTreeAddFile = (tree: Tree, files: { [name: string]: BlobFile }): {} => {
      for (const content of Object.values(tree.entry)) {
        if (content instanceof BlobFile) {
          files[content.name] = content;
        } else if (content instanceof Tree) {
          serachTreeAddFile(content, files);
        }
      }
      return files;
    };

    // base, target, currentのファイルを取得
    const baseFiles: { [name: string]: BlobFile } = {};
    serachTreeAddFile(baseCommit.tree, baseFiles);

    const currentFiles: { [name: string]: BlobFile } = {};
    serachTreeAddFile(currentCommit.tree, currentFiles);

    const targetFiles: { [name: string]: BlobFile } = {};
    serachTreeAddFile(targetCommit.tree, targetFiles);

    // currentとtargetの独自のファイルを抽出。
    for (const fileName in currentFiles) {
      if (!targetFiles[fileName]) changeFiles.push(currentFiles[fileName]);
    }

    for (const fileName in targetFiles) {
      if (!currentFiles[fileName]) changeFiles.push(targetFiles[fileName]);
    }

    // 共通のファイルを取得
    const commonFiles: { [name: string]: BlobFile } = {};
    for (const file in baseFiles) {
      if (currentFiles[file] && targetFiles[file]) {
        commonFiles[file] = baseFiles[file];
      }
    }

    // baseFilesに存在しないファイルで、currentFilesとtargetFilesに存在するファイルを取得
    for (const file in targetFiles) {
      if (currentFiles[file] && !commonFiles[file]) {
        commonFiles[file] = targetFiles[file];
      }
    }

    // コンフリクトを検出
    for (const fileName in commonFiles) {
      const targetFile = targetFiles[fileName];
      const currentFile = currentFiles[fileName];
      const baseFile = baseFiles[fileName];

      if (targetFile.getId() !== currentFile.getId()) {
        if (targetFile.getId() === baseFile.getId() && currentFile.getId() !== baseFile.getId()) {
          // マージ元のファイルだけが変更されている場合
          changeFiles.push(currentFile);
        } else if (currentFile.getId() === baseFile.getId() && targetFile.getId() !== baseFile.getId()) {
          // マージ先のファイルだけが変更されている場合
          changeFiles.push(targetFile);
        } else if (currentFile.getId() !== baseFile.getId() && targetFile.getId() !== baseFile.getId()) {
          // 両方のファイルが変更されている場合。つまりコンフリクト
          conflictFiles.push(commonFiles[fileName]);
        }
      } else {
        // 両方のファイルが変更されていない場合
        changeFiles.push(targetFile);
      }
    }
    return [changeFiles, conflictFiles];
  }

  /**
   * マージ先と現在のコミットの共通の親コミットを検索する。
   * @param targetCommitID - マージ先のコミットID
   * @param currentCommitID - 現在のコミットID
   * @returns 共通の親コミットのIDを返す。共通の親コミットが存在しない場合はnullを返す。
   */
  findBaseCommit(targetCommitID: string, currentCommitID: string): string | null {
    // マージ先と現在のコミットの親コミットを取得
    const targetCommitParents = new Set();
    const currentCommitParents = new Set();

    let currentCommit = this.commitList[currentCommitID!];
    while (currentCommit) {
      currentCommitParents.add(currentCommit.getId());
      currentCommit = this.commitList[currentCommit.getParentId()!];
    }

    let targetCommit = this.commitList[targetCommitID!];
    while (targetCommit) {
      if (currentCommitParents.has(targetCommit.getId())) {
        return targetCommit.getId();
      }
      targetCommitParents.add(targetCommit.getId());
      targetCommit = this.commitList[targetCommit.getParentId()!];
    }

    return null;
  }

  /**
   * ステージングエリアのファイルを元にツリーを作成し、コミットを作成する。
   * また、初回コミットの場合はmasterブランチを作成する。
   * indexをクリアする。
   * @param message - コミットメッセージ
   * @returns コミットのIDを返す。
   */
  async commit(message: string) {
    const newTree = await this.generateRepositoryTree();
    this.treeList[newTree.getId()] = newTree;
    const newCommit = await Commit.init(message, newTree, this.head, this.currentBranch);
    this.commitList[newCommit.getId()] = newCommit;
    if (this.checkBranch("master")) {
      this.branchList[this.currentBranch] = newCommit.getId();
    } else {
      this.branchList["master"] = newCommit.getId();
      this.currentBranch = "master";
      newCommit.setBranch("master");
    }
    this.head = newCommit.getId();
    this.index.clearStage();
    return newCommit.getId();
  }

  /**
   * generateTreeメソッドで使うprivateメソッド。
   * BlobFileのインスタンスを受け取り、treeに追加する。
   * @param entry - BlobFileのインスタンス
   * @param tree - Treeのインスタンス
   */
  private async handleFileEntry(entry: BlobFile, tree: Tree) {
    if (this.index.stagedFiles[entry.getId()]) {
      // ステージングされたファイルに該当するファイルをfileListから取得し、treeに追加する
      const stagedFile = this.index.stagedFiles[entry.getId()];
      const file = this.fileList[stagedFile.getId()];
      tree.addEntry(file);
      return;
    }
    // 2回目以降のコミットの場合、親コミットのツリーからファイルを取得し、treeに追加する
    // つまり、今回のコミットでステージングしていないファイルは、親コミットのツリーから取得する
    if (this.head !== null) {
      // const parentID = this.commitList[this.head].getId();
      // コミットでは、最後の段階でthis.headが更新されるので、treeを作る時は、今回のコミットの親の親コミットidを取得してしまう。
      const parentCommitTree = this.commitList[this.head].tree;
      const file = this.searchTree(entry.getId(), parentCommitTree);
      if (file !== null) {
        tree.addEntry(file);
      }
    }
  }

  /**
   * generateTreeメソッドで使うprivateメソッド。
   * Folderのインスタンスを受け取り、treeを生成する。
   * @param entry - Folderのインスタンス
   * @param tree - Treeのインスタンス
   */
  private async handleFolderEntry(entry: Folder, tree: Tree) {
    const subTree = await this.generateTree(entry);
    if (subTree) {
      tree.addEntry(subTree);
    }
  }

  /**
   * Folderのインスタンスを受け取り、再帰的にTreeを生成する。
   * @param folder - Folderのインスタンス
   * @returns 生成したルートTreeのPromiseオブジェクト
   */
  async generateTree(folder: Folder): Promise<Tree> {
    const tree = await Tree.init(folder.name);
    const entries = Object.entries(folder.contents);
    for (const [, entry] of entries) {
      if (entry instanceof BlobFile) {
        await this.handleFileEntry(entry, tree);
      } else if (entry instanceof Folder) {
        await this.handleFolderEntry(entry, tree);
      }
    }
    await tree.createId();
    return tree;
  }

  /**
   * Treeのインスタンスを再帰的に検索し、指定したIDのBlobFileを返す。
   * @param id - 検索するBlobFileのID
   * @param tree - 検索するTreeのインスタンス
   * @returns 指定したIDのBlobFileを返す。見つからない場合はnullを返す。
   */
  searchTree(id: string, tree: Tree): BlobFile | null {
    for (const key in tree.entry) {
      const entry = tree.entry[key];
      if (key === id && entry instanceof BlobFile) {
        return entry;
      } else if (entry instanceof Tree) {
        const found = this.searchTree(id, entry);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  /**
   * 現在のステージングされているファイルをFileListに追加し、Treeを生成する。
   * @returns 生成したツリーのPromiseオブジェクト
   */
  async generateRepositoryTree(): Promise<Tree> {
    await this.addFileList(Object.values(this.index.stagedFiles));
    return await this.generateTree(Contents.folder);
  }
}
