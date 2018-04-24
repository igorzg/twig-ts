import {readFile} from "fs";
import {sep, normalize} from "path";
import {isObject} from "./core";


export interface IFileSystemConfig {
  basePath: string;
  themes: string[];
}

/**
 * File system
 */
export class FileSystem implements IFileSystemConfig {

  basePath: string = process.cwd();
  themes: string[];

  constructor(config?: IFileSystemConfig) {
    if (isObject(config)) {
      this.basePath = config.basePath;
      this.themes = config.themes;
    }
  }

  /**
   * Find file
   * @param {string} path
   * @returns {string}
   */
  findFile(path: string): string {
    return normalize(path);
  }
  /**
   * Read file from path
   * @param {string} path
   * @returns {Promise<Buffer>}
   */
  readFile(path: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      readFile(this.findFile(path), (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

}
