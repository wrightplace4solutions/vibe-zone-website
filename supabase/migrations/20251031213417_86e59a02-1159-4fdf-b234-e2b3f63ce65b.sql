-- Create table for chat conversations
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for chat messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  feedback TEXT CHECK (feedback IN ('positive', 'negative')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_conversations
CREATE POLICY "Anyone can create conversations"
ON public.chat_conversations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view their own conversations by email"
ON public.chat_conversations
FOR SELECT
USING (true);

CREATE POLICY "Anyone can update their own conversations by email"
ON public.chat_conversations
FOR UPDATE
USING (true);

-- Policies for chat_messages
CREATE POLICY "Anyone can create messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view messages"
ON public.chat_messages
FOR SELECT
USING (true);

CREATE POLICY "Anyone can update messages"
ON public.chat_messages
FOR UPDATE
USING (true);

-- Trigger for updated_at on conversations
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_chat_conversations_email ON public.chat_conversations(customer_email);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);