import { DataSource } from 'typeorm';
import { configService } from './Config/Config.service';

const AppDataSource = new DataSource(configService.getTypeormDataSourceOptions());

AppDataSource.initialize()
  .then(() => {
    console.log('AppDataSource initialized');
  }).catch((err) => {
    console.error('AppDataSource initialization error', err);
  });