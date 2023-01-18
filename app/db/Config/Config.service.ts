import dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';
import fs from 'fs';
import path from 'path';


// * 프로젝트 루트의 *.env 파일 전부 import
const rootPath = path.join(__dirname, '../../..');
const envPath = path.join(__dirname, '../../../env');

fs.readdirSync(rootPath)
  .filter((filename) => !!filename.match(/.*\.env/))
  .forEach((filename) => {
    console.info(`dotenv loading: ${filename}`);
    dotenv.config({
      path: path.join(rootPath, filename),
    });
  });

if (fs.existsSync(envPath)) {
  fs.readdirSync(envPath)
    .filter((filename) => !!filename.match(/.*\.env/))
    .forEach((filename) => {
      console.info(`dotenv loading: ${filename}`);
      dotenv.config({
        path: path.join(envPath, filename),
      });
    });
}

dotenv.config();

/**
 * nodegui 비 종속적 cli 상황에서 공유된 config 관리를 위해 독립적인 서비스 구성
 */
class ConfigService {
  /**
   * 생성자
   * @param {any} env - env 오브젝트 입력
   */
  constructor(private env: { [k: string]: string | undefined }) {}

  /**
   * 컨피그 값 읽기
   * @param {string} key
   * @param {boolean} [throwOnMissing=true]
   * @return {string}
   * @throws {Error} throwOnMissing이 true일때 키 값이 없으면 반환
   */
  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`Config error - missing env.${key}`);
    }

    return value || '';
  }

  /**
   * 해당하는 키 값들이 존재하는지 검사
   * @param {string[]} keys
   * @return {ConfigService}
   * @throws {Error} 하나라도 키 값이 없으면 반환
   */
  public ensureValues(keys: string[]): ConfigService {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  /**
   * 프로덕션 환경 플래그가 development 와 일치하지 않는지 검사
   * @return {boolean}
   */
  public isProduction(): boolean {
    const mode = this.getValue('MODE', false).toLowerCase();
    return mode != 'development';
  }

  /**
   * TypeOrmModuleOptions 형식에 맞춘 config 반환
   * @return {TypeOrmModuleOptions}
   */
  public getTypeormDataSourceOptions(): DataSourceOptions {
    const option: DataSourceOptions = {
      type: 'better-sqlite3',
      database: 'alspotify.db',

      entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
      migrations: [path.join(__dirname, '../migration/*{.ts,.js}')],

      synchronize: true, // DO NOT USE IN PRODUCTION
      logging: this.isProduction() ? ['error'] : ['error', 'query'],
    };

    return option;
  }
}

const configService: ConfigService = new ConfigService(process.env);

if (configService.isProduction()) {
  console.log('config.service> 🌠 Production mode');
} else {console.warn('config.service> 🚧 Development mode');}

export { configService };