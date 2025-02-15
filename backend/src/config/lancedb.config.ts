import { registerAs } from '@nestjs/config';

export default registerAs('lancedb', () => ({
	path: process.env.LANCEDB_PATH || './data/lancedb',
}));