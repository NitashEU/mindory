import { Controller, Get, Query } from '@nestjs/common';
import { CodeProcessingService } from './code-processing.service';
import { SearchCodeDto } from './dto/search-code.dto';

@Controller('code')
export class CodeProcessingController {
	constructor(private readonly codeProcessingService: CodeProcessingService) {}

	@Get('search')
	async searchCode(@Query() searchDto: SearchCodeDto) {
		return this.codeProcessingService.searchCode(
			searchDto.query,
			searchDto.limit
		);
	}
}