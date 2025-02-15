-- Create repositories table
CREATE TABLE repositories (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	icon TEXT,
	url TEXT NOT NULL,
	name TEXT NOT NULL,
	description TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
	user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own repositories" ON repositories
	FOR INSERT TO authenticated
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own repositories" ON repositories
	FOR SELECT TO authenticated
	USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own repositories" ON repositories
	FOR UPDATE TO authenticated
	USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own repositories" ON repositories
	FOR DELETE TO authenticated
	USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = TIMEZONE('utc'::text, NOW());
	RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_repositories_updated_at
	BEFORE UPDATE ON repositories
	FOR EACH ROW
	EXECUTE FUNCTION update_updated_at_column();