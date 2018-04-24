import {readFile, readFileSync} from "fs";
import {sep, normalize} from "path";
import {isObject} from "./core";


export interface IFileSystemConfig {
  basePath: string;
  themes: string[];
}

export interface IReadOptions {
  encoding: string;
  flag?: string;
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
    return normalize(this.basePath + path);
  }
  /**
   * Read file sync
   * @param {string} path
   * @param {IReadOptions} options
   * @returns {Buffer}
   */
  readFileSync(path: string, options?: IReadOptions): Buffer {
    let args: any[] = [this.findFile(path)];
    if (isObject(options)) {
      args.push(options);
    }
    return readFileSync.apply({}, args);
  }
  /**
   *
   * @param {string} path
   * @param {IReadOptions} options
   * @returns {Promise<Buffer>}
   */
  readFile(path: string, options?: IReadOptions): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      let args: any[] = [this.findFile(path)];
      if (isObject(options)) {
        args.push(options);
      }
      args.push(
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
      readFile.apply({}, args);
    });
  }

}
