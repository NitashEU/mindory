import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { CreateRepositoryDto, UpdateRepositoryDto, Repository } from './dto/repository.dto';

@Injectable()
export class RepositoriesService {
	constructor(private readonly supabaseService: SupabaseService) {}

	async create(userId: string, createRepositoryDto: CreateRepositoryDto): Promise<Repository> {
		const { data, error } = await this.supabaseService.client
			.from('repositories')
			.insert({
				...createRepositoryDto,
				user_id: userId
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	async findAll(userId: string): Promise<Repository[]> {
		const { data, error } = await this.supabaseService.client
			.from('repositories')
			.select('*')
			.eq('user_id', userId)
			.order('updated_at', { ascending: false });

		if (error) throw error;
		return data;
	}

	async update(userId: string, id: string, updateRepositoryDto: UpdateRepositoryDto): Promise<Repository> {
		const { data, error } = await this.supabaseService.client
			.from('repositories')
			.update(updateRepositoryDto)
			.eq('id', id)
			.eq('user_id', userId)
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	async remove(userId: string, id: string): Promise<void> {
		const { error } = await this.supabaseService.client
			.from('repositories')
			.delete()
			.eq('id', id)
			.eq('user_id', userId);

		if (error) throw error;
	}
}