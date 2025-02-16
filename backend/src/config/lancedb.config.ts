import { registerAs } from '@nestjs/config';
import * as path from 'path';

export default registerAs('lancedb', () => ({
	uri: process.env.LANCEDB_URI || path.join(__dirname, '../../data/lancedb'),
}));