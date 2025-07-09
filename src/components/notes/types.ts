export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  // Champs Supabase
  created_by?: string;
  organization_id?: string;
  collaborators?: NoteCollaborator[];
  isShared?: boolean;
  canEdit?: boolean;
  isCreator?: boolean;
}

export interface NoteCollaborator {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  can_edit: boolean;
  is_creator: boolean;
}

export interface OrganizationMember {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
} 