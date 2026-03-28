-- Migration to add contact details to the projects table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS contact_person_name TEXT,
ADD COLUMN IF NOT EXISTS contact_person_email TEXT,
ADD COLUMN IF NOT EXISTS contact_person_mobile TEXT;
