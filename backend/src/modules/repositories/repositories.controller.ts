import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
	user: {
		id: string;
		[key: string]: any;
	};
}
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RepositoriesService } from './repositories.service';
import { CreateRepositoryDto, UpdateRepositoryDto, Repository } from './dto/repository.dto';

@Controller('repositories')
@UseGuards(JwtAuthGuard)
export class RepositoriesController {
	constructor(private readonly repositoriesService: RepositoriesService) {}

	@Post()
	create(@Request() req: AuthenticatedRequest, @Body() createRepositoryDto: CreateRepositoryDto): Promise<Repository> {
		return this.repositoriesService.create(req.user.id, createRepositoryDto);
	}

	@Get()
	findAll(@Request() req: AuthenticatedRequest): Promise<Repository[]> {
		return this.repositoriesService.findAll(req.user.id);
	}

	@Put(':id')
	update(
		@Request() req: AuthenticatedRequest,
		@Param('id') id: string,
		@Body() updateRepositoryDto: UpdateRepositoryDto
	): Promise<Repository> {
		return this.repositoriesService.update(req.user.id, id, updateRepositoryDto);
	}

	@Delete(':id')
	remove(@Request() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
		return this.repositoriesService.remove(req.user.id, id);
	}
}