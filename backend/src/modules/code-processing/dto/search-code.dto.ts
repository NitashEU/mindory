import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchCodeDto {
	@IsString()
	query: string;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(1)
	limit?: number;
}