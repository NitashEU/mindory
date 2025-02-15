-- Enable the pgraph extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgraph;

-- Create the function to handle code entity graph creation
CREATE OR REPLACE FUNCTION create_code_entity_graph(entities jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
	entity_data jsonb;
	entity_record record;
BEGIN
	-- Create nodes for all entities first
	FOR entity_data IN SELECT * FROM jsonb_array_elements(entities)
	LOOP
		INSERT INTO pgraph.node (properties)
		VALUES (jsonb_build_object(
			'type', entity_data->>'type',
			'name', entity_data->>'name',
			'content', entity_data->>'content',
			'filePath', entity_data->>'filePath',
			'startLine', (entity_data->>'startLine')::int,
			'endLine', (entity_data->>'endLine')::int,
			'vector', entity_data->'vector'
		))
		RETURNING * INTO entity_record;

		-- Store the node id mapping for later use in creating edges
		PERFORM set_config(
			'code_entity.' || entity_data->>'name',
			entity_record.id::text,
			true  -- is_local = true, only for current transaction
		);
	END LOOP;

	-- Create edges for dependencies
	FOR entity_data IN SELECT * FROM jsonb_array_elements(entities)
	LOOP
		-- For each dependency in the entity
		FOR dep_name IN SELECT * FROM jsonb_array_elements_text(entity_data->'dependencies')
		LOOP
			-- Get the stored node IDs and create the edge
			INSERT INTO pgraph.edge (source, target, label)
			SELECT 
				(current_setting('code_entity.' || entity_data->>'name'))::uuid,
				(current_setting('code_entity.' || dep_name))::uuid,
				'DEPENDS_ON'
			WHERE 
				current_setting('code_entity.' || entity_data->>'name', true) IS NOT NULL
				AND current_setting('code_entity.' || dep_name, true) IS NOT NULL;
		END LOOP;
	END LOOP;
END;
$$;