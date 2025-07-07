import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from './AuthProvider';
import { toast } from 'sonner';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { supabase } from '@/lib/supabase';

type AuthStep = 'form' | 'email-confirmation' | 'success';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<AuthStep>('form');
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const { signIn, signUp } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          // Gestion spécifique des erreurs courantes
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email ou mot de passe incorrect. Vérifiez vos informations.');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Votre email n\'est pas encore confirmé. Vérifiez votre boîte mail.', {
              duration: 6000,
              action: {
                label: 'Renvoyer',
                onClick: () => handleResendConfirmation(formData.email)
              }
            });
          } else if (error.message.includes('Too many requests')) {
            toast.error('Trop de tentatives de connexion. Attendez quelques minutes.');
          } else if (error.message.includes('User not found')) {
            toast.error('Aucun compte trouvé avec cet email. Créez un compte d\'abord.');
          } else {
            toast.error(`Erreur de connexion : ${error.message}`);
          }
        } else {
          toast.success('Connexion réussie !');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Les mots de passe ne correspondent pas');
          return;
        }

        if (formData.password.length < 6) {
          toast.error('Le mot de passe doit contenir au moins 6 caractères');
          return;
        }
        
        const { data, error } = await signUp(formData.email, formData.password, formData.fullName);
        
        if (error) {
          // Gestion spécifique des erreurs d'inscription
          if (error.message.includes('User already registered')) {
            toast.error('Un compte existe déjà avec cet email. Essayez de vous connecter.', {
              duration: 5000,
              action: {
                label: 'Se connecter',
                onClick: () => setIsLogin(true)
              }
            });
          } else if (error.message.includes('Password should be at least 6 characters')) {
            toast.error('Le mot de passe doit contenir au moins 6 caractères');
          } else if (error.message.includes('Unable to validate email address')) {
            toast.error('Adresse email invalide. Vérifiez le format.');
          } else if (error.message.includes('Signup is disabled')) {
            toast.error('Les inscriptions sont temporairement désactivées.');
          } else {
            toast.error(`Erreur lors de l'inscription : ${error.message}`);
          }
        } else {
          // Si l'utilisateur n'est pas confirmé, afficher l'étape de confirmation
          if (data.user && !data.user.email_confirmed_at) {
            setUserEmail(formData.email);
            setCurrentStep('email-confirmation');
            toast.success('Email de confirmation envoyé ! Vérifiez votre boîte mail.', {
              duration: 4000
            });
          } else {
            // Utilisateur déjà confirmé (cas rare)
            setCurrentStep('success');
            toast.success('Compte créé avec succès !');
            setTimeout(() => {
              resetForm();
            }, 2000);
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Une erreur inattendue est survenue. Réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      confirmPassword: ''
    });
    setCurrentStep('form');
    setUserEmail('');
    setIsLogin(true);
    setShowPassword(false);
  };

  const handleResendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        toast.error('Erreur lors du renvoi de l\'email de confirmation');
      } else {
        toast.success('Email de confirmation renvoyé !');
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    }
  };

  // Rendu de l'étape de confirmation d'email
  if (currentStep === 'email-confirmation') {
    return (
      <div className="h-screen flex flex-col relative overflow-hidden">
        <AnimatedBackground />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Vérifiez votre email
                </h2>
                
                <p className="text-gray-600 mb-2">
                  Nous avons envoyé un lien de confirmation à :
                </p>
                
                <p className="font-medium text-gray-800 mb-6">
                  {userEmail}
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Prochaines étapes :</p>
                      <ol className="list-decimal list-inside space-y-1 text-blue-700">
                        <li>Ouvrez votre boîte email</li>
                        <li>Cliquez sur le lien de confirmation</li>
                        <li>Revenez ici pour vous connecter</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleResendConfirmation(userEmail)}
                    disabled={loading}
                    variant="outline"
                    className="w-full h-12 border-gray-200 hover:bg-gray-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Renvoyer l'email
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => setCurrentStep('form')}
                    variant="ghost"
                    className="w-full h-12 text-gray-600 hover:text-gray-800"
                  >
                    Retour au formulaire
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-6">
                  Vous ne trouvez pas l'email ? Vérifiez vos spams ou contactez le support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rendu de l'étape de succès
  if (currentStep === 'success') {
    return (
      <div className="h-screen flex flex-col relative overflow-hidden">
        <AnimatedBackground />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Bienvenue !
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Votre compte a été créé avec succès. Vous allez être redirigé...
                </p>

                <div className="w-8 h-8 mx-auto border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rendu du formulaire principal
  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light text-gray-700 mb-2">Home.io</h1>
            <p className="text-gray-500">Votre espace personnel de navigation</p>
          </div>

          {/* Auth Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {isLogin ? 'Connexion' : 'Créer un compte'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {isLogin 
                    ? 'Connectez-vous à votre espace personnel' 
                    : 'Rejoignez Home.io dès maintenant'
                  }
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Nom complet
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Votre nom complet"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="pl-10 h-12 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 h-12 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10 h-12 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirmer le mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 h-12 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Se connecter' : 'Créer le compte'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {isLogin 
                    ? "Pas encore de compte ? S'inscrire" 
                    : "Déjà un compte ? Se connecter"
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}