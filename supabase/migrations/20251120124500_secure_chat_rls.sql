-- Strengthen chat conversation/message row-level security to stop unrestricted data access

-- Remove permissive policies that exposed all conversations/messages
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can view their own conversations by email" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can update their own conversations by email" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can create messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can update messages" ON public.chat_messages;

-- Helper expressions (inline) rely on auth.jwt() being present on every request.
-- service_role + supabase_admin bypass RLS for operational tooling.

CREATE POLICY "Staff manage chat conversations"
ON public.chat_conversations
FOR ALL
USING (
  coalesce(jsonb_extract_path_text(auth.jwt(), 'role'), '') IN ('service_role', 'supabase_admin')
)
WITH CHECK (
  coalesce(jsonb_extract_path_text(auth.jwt(), 'role'), '') IN ('service_role', 'supabase_admin')
);

CREATE POLICY "Customers read their conversations"
ON public.chat_conversations
FOR SELECT
USING (
  coalesce(jsonb_extract_path_text(auth.jwt(), 'role'), '') = 'authenticated'
  AND lower(customer_email) = lower(coalesce(jsonb_extract_path_text(auth.jwt(), 'email'), ''))
);

CREATE POLICY "Customers create their conversations"
ON public.chat_conversations
FOR INSERT
WITH CHECK (
  coalesce(jsonb_extract_path_text(auth.jwt(), 'role'), '') = 'authenticated'
  AND lower(customer_email) = lower(coalesce(jsonb_extract_path_text(auth.jwt(), 'email'), ''))
);

CREATE POLICY "Customers update their conversations"
ON public.chat_conversations
FOR UPDATE
USING (
  coalesce(jsonb_extract_path_text(auth.jwt(), 'role'), '') = 'authenticated'
  AND lower(customer_email) = lower(coalesce(jsonb_extract_path_text(auth.jwt(), 'email'), ''))
)
WITH CHECK (
  coalesce(jsonb_extract_path_text(auth.jwt(), 'role'), '') = 'authenticated'
  AND lower(customer_email) = lower(coalesce(jsonb_extract_path_text(auth.jwt(), 'email'), ''))
);

CREATE POLICY "Staff manage chat messages"
ON public.chat_messages
FOR ALL
USING (
  coalesce(jsonb_extract_path_text(auth.jwt(), 'role'), '') IN ('service_role', 'supabase_admin')
)
WITH CHECK (
  coalesce(jsonb_extract_path_text(auth.jwt(), 'role'), '') IN ('service_role', 'supabase_admin')
);

CREATE POLICY "Customers read their messages"
ON public.chat_messages
FOR SELECT
USING (
  coalesce(jsonb_extract_path_text(auth.jwt(), 'role'), '') = 'authenticated'
  AND conversation_id IN (
    SELECT id
    FROM public.chat_conversations
    WHERE lower(customer_email) = lower(coalesce(jsonb_extract_path_text(auth.jwt(), 'email'), ''))
  )
);

CREATE POLICY "Customers create their messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  coalesce(jsonb_extract_path_text(auth.jwt(), 'role'), '') = 'authenticated'
  AND conversation_id IN (
    SELECT id
    FROM public.chat_conversations
    WHERE lower(customer_email) = lower(coalesce(jsonb_extract_path_text(auth.jwt(), 'email'), ''))
  )
);

CREATE POLICY "Customers update their messages"
ON public.chat_messages
FOR UPDATE
USING (
  coalesce(jsonb_extract_path_text(auth.jwt(), 'role'), '') = 'authenticated'
  AND conversation_id IN (
    SELECT id
    FROM public.chat_conversations
    WHERE lower(customer_email) = lower(coalesce(jsonb_extract_path_text(auth.jwt(), 'email'), ''))
  )
)
WITH CHECK (
  coalesce(jsonb_extract_path_text(auth.jwt(), 'role'), '') = 'authenticated'
  AND conversation_id IN (
    SELECT id
    FROM public.chat_conversations
    WHERE lower(customer_email) = lower(coalesce(jsonb_extract_path_text(auth.jwt(), 'email'), ''))
  )
);
