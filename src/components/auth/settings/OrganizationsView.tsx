import { useState } from 'react';
import { ChevronLeft, Users, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useAuthContext } from '@/components/auth/AuthProvider';
// import { OrganizationForm } from './OrganizationForm';
// import { MemberForm } from './MemberForm';



interface OrganizationsViewProps {
  onBack: () => void;
}

export function OrganizationsView({ onBack }: OrganizationsViewProps) {
  const { user } = useAuthContext();
  const { 
    currentOrganization, 
    members, 
    updateOrganization: _updateOrganization, 
    inviteMember, 
    removeMember, 
    updateMemberRole: _updateMemberRole 
  } = useOrganizations();
  

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');

  // Vérifier si l'utilisateur est admin ou propriétaire
  const currentUserMember = members.find(member => member.user_id === user?.id);
  const isAdminOrOwner = currentUserMember?.role === 'admin' || currentUserMember?.role === 'owner' || currentOrganization?.owner_id === user?.id;



  const handleInviteMember = async (email: string, role: 'admin' | 'member') => {
    if (!currentOrganization) return;

    try {
      const { error } = await inviteMember(currentOrganization.id, email, role);
      if (error) throw error;
      toast.success('Membre invité avec succès');
      setShowInviteForm(false);
      setInviteEmail('');
      setInviteRole('member');
    } catch (error) {
      toast.error('Erreur lors de l\'invitation');
      throw error;
    }
  };

  const handleSubmitInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    await handleInviteMember(inviteEmail.trim(), inviteRole);
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await removeMember(memberId);
      if (error) throw error;
      toast.success('Membre supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };







  // TODO: Réactiver les formulaires après correction des imports
  // if (currentForm === 'organization') {
  //   return (
  //     <div className="flex flex-col max-h-[70vh]">
  //       <OrganizationForm
  //         organization={editingOrganization}
  //         onSubmit={handleUpdateOrganization}
  //         onCancel={closeForm}
  //       />
  //     </div>
  //   );
  // }

  // if (currentForm === 'member') {
  //   return (
  //     <div className="flex flex-col max-h-[70vh]">
  //       <MemberForm
  //         onSubmit={handleInviteMember}
  //         onCancel={closeForm}
  //       />
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col max-h-[70vh]">
      {/* Header fixe */}
      <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-3 h-3" />
          <span>Retour</span>
        </button>
      </div>
      
      {/* Contenu scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="px-3 py-3">


          {currentOrganization ? (
            <>
              {/* Informations de l'organisation */}
              <div className="mb-6">
                <h4 className="text-xs font-medium text-gray-900 mb-3">Organisation actuelle</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{currentOrganization.name}</p>
                      {currentOrganization.description && (
                        <p className="text-xs text-gray-500 mt-1">{currentOrganization.description}</p>
                      )}
                    </div>

                  </div>
                </div>
              </div>

              {/* Membres de l'organisation */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-medium text-gray-900">Membres</h4>
                  {isAdminOrOwner && (
                    <button
                      onClick={() => setShowInviteForm(!showInviteForm)}
                      className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Inviter</span>
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <Users className="w-3 h-3 text-gray-400" />
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            {member.profiles?.full_name || member.profiles?.email}
                          </p>
                          <p className="text-xs text-gray-500">{member.profiles?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          member.role === 'owner' 
                            ? 'bg-purple-100 text-purple-700'
                            : member.role === 'admin'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {member.role === 'owner' ? 'Propriétaire' : 
                           member.role === 'admin' ? 'Admin' : 'Membre'}
                        </span>
                        {member.role !== 'owner' && isAdminOrOwner && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-xs text-red-600 hover:text-red-700 transition-colors"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {members.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-500">Aucun membre</p>
                  </div>
                )}

                {/* Formulaire d'invitation inline */}
                {showInviteForm && isAdminOrOwner && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <form onSubmit={handleSubmitInvite} className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="exemple@email.com"
                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Rôle</label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
                        >
                          <option value="member">Membre</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowInviteForm(false)}
                          className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={!inviteEmail.trim()}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Inviter
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-xs text-gray-500">Aucune organisation sélectionnée</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 