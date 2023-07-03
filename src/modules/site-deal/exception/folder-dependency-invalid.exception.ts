// TODO APIM-136: Make exceptions consistent
export class FolderDependencyInvalidException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
