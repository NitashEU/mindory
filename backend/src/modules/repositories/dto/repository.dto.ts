export class CreateRepositoryDto {
	name: string;
	url: string;
	description?: string;
	icon?: string;
}

export class UpdateRepositoryDto {
	name?: string;
	url?: string;
	description?: string;
	icon?: string;
}

export interface Repository {
	id: string;
	name: string;
	url: string;
	description: string | null;
	icon: string | null;
	created_at: string;
	updated_at: string;
	user_id: string;
}