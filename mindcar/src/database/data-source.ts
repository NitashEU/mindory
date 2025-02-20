import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DatabaseConfigService } from './database.config';

// Load environment variables
config();

const configService = new ConfigService();
const dbConfigService = new DatabaseConfigService(configService);

// Create data source configuration
export const dataSourceOptions: DataSourceOptions = {
  ...dbConfigService.getDataSourceOptions(),
} as DataSourceOptions;

// Create and export data source
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;