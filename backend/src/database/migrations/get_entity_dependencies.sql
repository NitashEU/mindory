-- Function to get dependencies for a given entity
CREATE OR REPLACE FUNCTION get_entity_dependencies(entity_name text)
RETURNS TABLE (
	dependency_name text,
	dependency_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
	RETURN QUERY
	WITH entity_node AS (
		SELECT id
		FROM pgraph.node
		WHERE properties->>'name' = entity_name
		LIMIT 1
	)
	SELECT 
		target_node.properties->>'name' as dependency_name,
		target_node.properties->>'type' as dependency_type
	FROM entity_node
	JOIN pgraph.edge ON pgraph.edge.source = entity_node.id
	JOIN pgraph.node target_node ON pgraph.edge.target = target_node.id
	WHERE pgraph.edge.label = 'DEPENDS_ON';
END;
$$;