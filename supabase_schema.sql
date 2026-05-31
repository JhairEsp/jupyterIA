-- =========================================================================
-- ESQUEMA SQL COMPLETO PARA JUPYTER (BASE DE DATOS SUPABASE)
-- =========================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- Clean Up (Opcional, en caso de reinstalación)
-- DROP TABLE IF EXISTS public.semantic_memories;
-- DROP TABLE IF EXISTS public.chat_messages;
-- DROP TABLE IF EXISTS public.chat_sessions;
-- DROP TABLE IF EXISTS public.profiles;

-- 1. TABLA DE PERFILES (Asociada a auth.users de Supabase)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT,
    preferences JSONB DEFAULT '{
        "theme": "dark",
        "voice_name": "jupyter-calm",
        "auto_minimize": true,
        "wake_word_enabled": true
    }'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) en Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden leer su propio perfil" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Trigger para crear perfil automáticamente al registrarse en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (new.id, new.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. TABLA DE SESIONES DE CONVERSACIÓN
CREATE TABLE public.chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT DEFAULT 'Nueva conversación',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS en Chat Sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propias sesiones"
ON public.chat_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propias sesiones"
ON public.chat_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden borrar sus propias sesiones"
ON public.chat_sessions FOR DELETE
USING (auth.uid() = user_id);


-- 3. TABLA DE MENSAJES (Historial lineal)
CREATE TABLE public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS en Chat Messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver mensajes de sus sesiones"
ON public.chat_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.chat_sessions s 
        WHERE s.id = session_id AND s.user_id = auth.uid()
    )
);

CREATE POLICY "Los usuarios pueden insertar mensajes en sus sesiones"
ON public.chat_messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.chat_sessions s 
        WHERE s.id = session_id AND s.user_id = auth.uid()
    )
);


-- 4. TABLA DE MEMORIA SEMÁNTICA (Vectores)
-- Soporta embeddings de 1536 dimensiones (adecuado para text-embedding-3-small de OpenAI)
CREATE TABLE public.semantic_memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    importance_score SMALLINT DEFAULT 1 CHECK (importance_score BETWEEN 1 AND 5),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices HNSW para búsquedas vectoriales veloces
CREATE INDEX ON public.semantic_memories USING hnsw (embedding vector_cosine_ops);

-- RLS en Semantic Memories
ALTER TABLE public.semantic_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su propia memoria semántica"
ON public.semantic_memories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear su propia memoria semántica"
ON public.semantic_memories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar su propia memoria semántica"
ON public.semantic_memories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden borrar su propia memoria semántica"
ON public.semantic_memories FOR DELETE
USING (auth.uid() = user_id);


-- 5. FUNCIONES PERSONALIZADAS DE BASE DE DATOS

-- Función de búsqueda por similitud de coseno para recuperar memorias
CREATE OR REPLACE FUNCTION public.match_memories (
    query_embedding VECTOR(1536),
    match_threshold FLOAT,
    match_count INT,
    p_user_id UUID
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    importance_score SMALLINT,
    similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.content,
        m.importance_score,
        1 - (m.embedding <=> query_embedding) AS similarity
    FROM public.semantic_memories m
    WHERE m.user_id = p_user_id 
      AND 1 - (m.embedding <=> query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;

-- Función para actualizar la fecha de último acceso de una memoria cuando sea recuperada
CREATE OR REPLACE FUNCTION public.update_memory_last_accessed(memory_ids UUID[])
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.semantic_memories
    SET last_accessed_at = timezone('utc'::text, now())
    WHERE id = ANY(memory_ids);
END;
$$;
