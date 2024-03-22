import { BlobFile } from "./blobFile";
const crypto = require("crypto");
class Commit {
  id: string;
  message: string;
  commitFiles: BlobFile[];
  parentCommitId: string | null;
  constructor(message: string, commitFiles: BlobFile[], parentCommitId: string) {
    this.id = this.createId();
    this.message = message;
    this.commitFiles = commitFiles;
    this.parentCommitId = parentCommitId;
  }

  private createId(): string {
    const currentDate = new Date();
    const user = "tutorialUser";
    const hash = crypto.createHash("sha1");
    hash.update(currentDate + user);
    return hash.digest("hex");
  }
}

export { Commit };
