import { useState } from 'react';
import { X, Building, Users, Settings, Plus, Trash2, UserPlus, Crown, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrganizationModal({ isOpen, onClose }: OrganizationModalProps) {
  const { user } = useAuthContext();
  const {
    organizations,
    currentOrganization,
    members,
    loading,
    setCurrentOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    inviteMember,
    removeMember,
    updateMemberRole,
  } = useOrganizations();

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'settings'>('overview');
  const [isCreating, setIsCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Formulaires
  const [newOrgForm, setNewOrgForm] = useState({ name: '', description: '' });
  const [editOrgForm, setEditOrgForm] = useState({ 
    name: currentOrganization?.name || '', 
    description: currentOrganization?.description || '' 
  });
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'member' as 'admin' | 'member' });

  if (!isOpen) return null;

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgForm.name.trim()) return;

    setActionLoading(true);
    try {
      const { error } = await createOrganization(newOrgForm.name, newOrgForm.description);
      if (error) {
        toast.error('Erreur lors de la création de l\'organisation');
      } else {
        toast.success('Organisation créée avec succès !');
        setNewOrgForm({ name: '', description: '' });
        setIsCreating(false);
        setActiveTab('overview');
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization || !editOrgForm.name.trim()) return;

    setActionLoading(true);
    try {
      const { error } = await updateOrganization(currentOrganization.id, {
        name: editOrgForm.name,
        description: editOrgForm.description,
      });
      if (error) {
        toast.error('Erreur lors de la mise à jour');
      } else {
        toast.success('Organisation mise à jour !');
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (!currentOrganization || !confirm('Êtes-vous sûr de vouloir supprimer cette organisation ?')) return;

    setActionLoading(true);
    try {
      const { error } = await deleteOrganization(currentOrganization.id);
      if (error) {
        toast.error('Erreur lors de la suppression');
      } else {
        toast.success('Organisation supprimée');
        onClose();
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setActionLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization || !inviteForm.email.trim()) return;

    setActionLoading(true);
    try {
      const { error } = await inviteMember(currentOrganization.id, inviteForm.email, inviteForm.role);
      if (error) {
        toast.error('Erreur lors de l\'invitation');
      } else {
        toast.success('Membre invité avec succès !');
        setInviteForm({ email: '', role: 'member' });
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) return;

    setActionLoading(true);
    try {
      const { error } = await removeMember(memberId);
      if (error) {
        toast.error('Erreur lors de la suppression du membre');
      } else {
        toast.success('Membre retiré');
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setActionLoading(false);
    }
  };

  const isOwner = currentOrganization?.owner_id === user?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl mx-4 max-h-[85vh] overflow-hidden mt-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Building className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {isCreating ? 'Créer une organisation' : 'Gestion des organisations'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isCreating ? 'Créez votre nouvelle organisation' : 'Gérez vos organisations et équipes'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100/50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex h-[600px]">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-100 p-4 space-y-2">
              {/* Sélecteur d'organisation */}
              {!isCreating && (
                <div className="space-y-2 mb-4">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Organisations
                  </Label>
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => setCurrentOrganization(org)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        currentOrganization?.id === org.id
                          ? 'bg-blue-50 border border-blue-200 text-blue-700'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="font-medium truncate">{org.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {org.owner_id === user?.id ? 'Propriétaire' : 'Membre'}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-1">
                {!isCreating && (
                  <>
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`w-full text-left p-2 rounded-lg transition-colors flex items-center space-x-2 ${
                        activeTab === 'overview' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      <span>Vue d'ensemble</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('members')}
                      className={`w-full text-left p-2 rounded-lg transition-colors flex items-center space-x-2 ${
                        activeTab === 'members' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Membres</span>
                    </button>
                    {isOwner && (
                      <button
                        onClick={() => setActiveTab('settings')}
                        className={`w-full text-left p-2 rounded-lg transition-colors flex items-center space-x-2 ${
                          activeTab === 'settings' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Paramètres</span>
                      </button>
                    )}
                  </>
                )}
                
                <hr className="my-2" />
                
                <button
                  onClick={() => setIsCreating(!isCreating)}
                  className="w-full text-left p-2 rounded-lg transition-colors flex items-center space-x-2 text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreating ? 'Annuler' : 'Nouvelle organisation'}</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {isCreating ? (
                <form onSubmit={handleCreateOrganization} className="space-y-4">
                  <div>
                    <Label htmlFor="orgName">Nom de l'organisation</Label>
                    <Input
                      id="orgName"
                      value={newOrgForm.name}
                      onChange={(e) => setNewOrgForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Mon équipe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="orgDescription">Description (optionnel)</Label>
                    <Textarea
                      id="orgDescription"
                      value={newOrgForm.description}
                      onChange={(e) => setNewOrgForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description de votre organisation..."
                      rows={3}
                    />
                  </div>
                  <Button type="submit" disabled={actionLoading} className="w-full">
                    {actionLoading ? 'Création...' : 'Créer l\'organisation'}
                  </Button>
                </form>
              ) : currentOrganization ? (
                <>
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {currentOrganization.name}
                        </h3>
                        <p className="text-gray-600">
                          {currentOrganization.description || 'Aucune description'}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-800">{members.length}</div>
                          <div className="text-sm text-gray-600">Membres</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-800">
                            {new Date(currentOrganization.created_at).getFullYear()}
                          </div>
                          <div className="text-sm text-gray-600">Année de création</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'members' && (
                    <div className="space-y-6">
                      {isOwner && (
                        <form onSubmit={handleInviteMember} className="p-4 bg-gray-50 rounded-lg space-y-3">
                          <h4 className="font-medium text-gray-800">Inviter un membre</h4>
                          <div className="flex space-x-2">
                            <Input
                              type="email"
                              placeholder="email@exemple.com"
                              value={inviteForm.email}
                              onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                              className="flex-1"
                            />
                            <Select
                              value={inviteForm.role}
                              onValueChange={(value: 'admin' | 'member') => 
                                setInviteForm(prev => ({ ...prev, role: value }))
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Membre</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button type="submit" disabled={actionLoading}>
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          </div>
                        </form>
                      )}

                      <div className="space-y-2">
                        {members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                {member.role === 'owner' ? (
                                  <Crown className="w-4 h-4 text-yellow-600" />
                                ) : member.role === 'admin' ? (
                                  <Shield className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <User className="w-4 h-4 text-gray-600" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">
                                  {member.profiles?.full_name || member.profiles?.email}
                                </div>
                                <div className="text-sm text-gray-500">{member.profiles?.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600 capitalize">{member.role}</span>
                              {isOwner && member.role !== 'owner' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'settings' && isOwner && (
                    <div className="space-y-6">
                      <form onSubmit={handleUpdateOrganization} className="space-y-4">
                        <div>
                          <Label htmlFor="editOrgName">Nom de l'organisation</Label>
                          <Input
                            id="editOrgName"
                            value={editOrgForm.name}
                            onChange={(e) => setEditOrgForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="editOrgDescription">Description</Label>
                          <Textarea
                            id="editOrgDescription"
                            value={editOrgForm.description}
                            onChange={(e) => setEditOrgForm(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                          />
                        </div>
                        <Button type="submit" disabled={actionLoading}>
                          {actionLoading ? 'Mise à jour...' : 'Mettre à jour'}
                        </Button>
                      </form>

                      <hr />

                      <div className="space-y-4">
                        <h4 className="font-medium text-red-600">Zone de danger</h4>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteOrganization}
                          disabled={actionLoading}
                        >
                          Supprimer l'organisation
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Aucune organisation</h3>
                  <p className="text-gray-600 mb-4">Créez votre première organisation pour commencer.</p>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une organisation
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}