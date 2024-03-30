/*/
Repository

/*/

import { Index } from ".";
import { BlobFile } from "./blobFile";
import { Commit } from "./commit";
import { Folder } from "./folder";
import { Tree } from "./tree";

export class Repository {
  rootFolder: Folder;
  index: Index;
  head: string | null;
  commitList: { [name: string]: Commit };
  fileList: { [name: string]: BlobFile };
  treeList: { [name: string]: Tree };
  branchList: { [name: string]: string };
  currentBranch: string;

  constructor() {
    this.rootFolder = new Folder("root");
    this.index = new Index();
    this.head = null;
    this.commitList = {};
    this.fileList = {};
    this.treeList = {};
    this.branchList = {};
    this.currentBranch = "";
  }

  stage(files: BlobFile[]) {
    this.index.addStage(files);
  }

  unstage(file: BlobFile) {
    this.index.removeStage(file);
  }

  resetStage() {
    this.index.clearStage();
  }

  createBranch(name: string, id: string) {
    if (!this.checkBranch(name)) return (this.branchList[name] = id);
    else return "same name branch is already";
  }

  checkBranch(name: string): boolean {
    return this.branchList[name] !== undefined;
  }


  // 現状ブランチの切り替えしかできない。後々コミットの切り替えにも対応する。
  checkOut(name: string) {
    if (this.checkBranch(name)) {
      this.currentBranch = name;
      this.head = this.branchList[name];
      return this.currentBranch;
    } else return null;
  }

  commit(message: string) {
    const newTree = this.generateRepositoryTree();
    this.treeList[newTree.id] = newTree;
    const newCommit = new Commit(message, newTree, this.head);
    this.commitList[newCommit.id] = newCommit;
    if (this.checkBranch("master")) {
      this.branchList[this.currentBranch] = newCommit.id;
    } else {
      this.createBranch("master", newCommit.id);
      this.currentBranch = "master";
    }
    this.head = newCommit.id;
    this.index.clearStage();
    return newCommit.id;
  }

  generateTree(folder: Folder): Tree {
    const tree = new Tree();
    const entries = Object.entries(folder.contents);
    for (const [name, entry] of entries) {
      if (entry instanceof BlobFile && this.index.stagedFiles[name]) {
        tree.addEntry(entry);
      } else if (entry instanceof Folder) {
        const subTree = this.generateTree(entry);
        if (subTree) {
          tree.addEntry(subTree);
        }
      }
    }
    return tree;
  }

  generateRepositoryTree(): Tree {
    return this.generateTree(this.rootFolder);
  }
}
