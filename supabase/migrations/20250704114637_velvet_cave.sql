/*
  # Fix user signup trigger

  1. Functions
    - `handle_new_user()` - Creates a profile entry when a new user signs up
  
  2. Triggers
    - Trigger on auth.users table to call handle_new_user function
  
  3. Security
    - Ensures profiles are automatically created for new users
    - Maintains data consistency between auth.users and public.profiles
*/

-- Create the trigger function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();