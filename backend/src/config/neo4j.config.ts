import { registerAs } from '@nestjs/config';

export default registerAs('neo4j', () => ({
	url: process.env.NEO4J_URL,
	username: process.env.NEO4J_USERNAME,
	password: process.env.NEO4J_PASSWORD,
}));