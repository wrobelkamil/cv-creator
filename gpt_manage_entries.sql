CREATE OR REPLACE FUNCTION gpt_manage_entries(
    action text,
    p_project_id uuid,
    p_entry_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    -- 1. GET ENTRIES (Returns Project + Experience + Skills)
    IF action = 'get_entries' THEN
        SELECT jsonb_build_object(
            'project', row_to_json(p),
            'experience', (
                SELECT COALESCE(jsonb_agg(e ORDER BY e.sort_order ASC, e.created_at DESC), '[]'::jsonb)
                FROM experience_entries e
                WHERE e.project_id = p_project_id
            ),
            'skills', COALESCE(p.skills, '[]'::jsonb),
            'custom_contacts', COALESCE(p.custom_contacts, '[]'::jsonb)
        )
        INTO result
        FROM projects p
        WHERE p.id = p_project_id;

    -- 2. UPDATE SKILLS
    ELSIF action = 'update_skills' THEN
        UPDATE projects
        SET skills = p_entry_data
        WHERE id = p_project_id;
        
        result := jsonb_build_object('status', 'success', 'message', 'Skills updated');

    -- 3. ADD EXPERIENCE
    ELSIF action = 'add_entry' THEN
        INSERT INTO experience_entries (project_id, role, company, period, description, sort_order)
        VALUES (
            p_project_id,
            p_entry_data->>'role',
            p_entry_data->>'company',
            p_entry_data->>'period',
            p_entry_data->>'description',
            (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM experience_entries WHERE project_id = p_project_id)
        )
        RETURNING to_jsonb(experience_entries.*) INTO result;

    -- 4. UPDATE EXPERIENCE
    ELSIF action = 'update_entry' THEN
        UPDATE experience_entries
        SET 
            role = COALESCE(p_entry_data->>'role', role),
            company = COALESCE(p_entry_data->>'company', company),
            period = COALESCE(p_entry_data->>'period', period),
            description = COALESCE(p_entry_data->>'description', description)
        WHERE id = (p_entry_data->>'id')::uuid AND project_id = p_project_id
        RETURNING to_jsonb(experience_entries.*) INTO result;

    -- 5. DELETE EXPERIENCE
    ELSIF action = 'delete_entry' THEN
        DELETE FROM experience_entries
        WHERE id = (p_entry_data->>'id')::uuid AND project_id = p_project_id;
        
        result := jsonb_build_object('status', 'success', 'deleted_id', p_entry_data->>'id');

    -- 6. UPDATE PROFILE (Summary, Role, Contact)
    ELSIF action = 'update_profile' THEN
        UPDATE projects
        SET 
            role = COALESCE(p_entry_data->>'role', role),
            summary = COALESCE(p_entry_data->>'summary', summary),
            portfolio = COALESCE(p_entry_data->>'portfolio', portfolio),
            email = COALESCE(p_entry_data->>'email', email),
            phone = COALESCE(p_entry_data->>'phone', phone),
            location = COALESCE(p_entry_data->>'location', location),
            linkedin = COALESCE(p_entry_data->>'linkedin', linkedin)
        WHERE id = p_project_id;
        
        result := jsonb_build_object('status', 'success', 'message', 'Profile updated');

    ELSE
        RAISE EXCEPTION 'Invalid action: %', action;
    END IF;

    RETURN result;
END;
$$;
