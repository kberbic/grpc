import path from 'path';
import logger from './logger.js';

const dotenv = await import('dotenv');
process.env.NODE_ENV = process.env.NODE_ENV || process.argv[2] || 'local';
const cf = dotenv.config({ path: path.resolve(`./.env.${process.env.NODE_ENV}`) });
if (cf.error) {
  if (process.env.NODE_ENV === 'mono') logger.info('For monolithic runner please create \'.env.mono\' configuration file in starter project. \'.env.mono\' need to contain configuration for all microservises');
  else logger.error(cf.error);

  process.exit(0);
}

export default cf;
