import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, CheckCircle, ArrowRight, Gift, CreditCard, 
  Users, Trophy, Star, Coins, Target, Zap
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  action?: () => void;
  reward?: string;
}

interface UserProgress {
  currentStep: number;
  completedSteps: string[];
  totalSteps: number;
  completionPercentage: number;
  nextReward: string;
  bonusEarned: number;
}

export default function OnboardingGuide() {
  const { toast } = useToast();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bienvenue sur BrachaVeHatzlacha !',
      description: 'Découvrez notre plateforme de loterie premium',
      icon: <Star className="w-6 h-6" />,
      completed: false,
      reward: '50₪ bonus'
    },
    {
      id: 'profile',
      title: 'Complétez votre profil',
      description: 'Ajoutez vos informations personnelles',
      icon: <Users className="w-6 h-6" />,
      completed: false,
      action: () => navigateToProfile(),
      reward: '25₪ bonus'
    },
    {
      id: 'deposit',
      title: 'Premier dépôt',
      description: 'Effectuez votre premier dépôt pour commencer',
      icon: <CreditCard className="w-6 h-6" />,
      completed: false,
      action: () => navigateToDeposit(),
      reward: '100₪ bonus (100% match)'
    },
    {
      id: 'first_ticket',
      title: 'Achetez votre premier ticket',
      description: 'Sélectionnez vos numéros chanceux',
      icon: <Target className="w-6 h-6" />,
      completed: false,
      action: () => navigateToLottery(),
      reward: '1 ticket gratuit'
    },
    {
      id: 'referral',
      title: 'Parrainez un ami',
      description: 'Gagnez des bonus en invitant vos amis',
      icon: <Gift className="w-6 h-6" />,
      completed: false,
      action: () => navigateToReferral(),
      reward: '100₪ par parrainage'
    },
    {
      id: 'complete',
      title: 'Félicitations !',
      description: 'Vous maîtrisez maintenant la plateforme',
      icon: <Trophy className="w-6 h-6" />,
      completed: false,
      reward: 'Statut VIP temporaire'
    }
  ];

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/user/onboarding/progress', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
        setActiveStep(data.currentStep || 0);
        
        // Update steps completion status
        onboardingSteps.forEach((step, index) => {
          step.completed = data.completedSteps.includes(step.id);
        });
      } else {
        // Initialize default progress
        setProgress({
          currentStep: 0,
          completedSteps: [],
          totalSteps: onboardingSteps.length,
          completionPercentage: 0,
          nextReward: '50₪ bonus',
          bonusEarned: 0
        });
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeStep = async (stepId: string) => {
    try {
      const response = await fetch('/api/user/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ stepId })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Étape complétée !",
          description: `Vous avez gagné : ${result.reward}`
        });
        
        fetchProgress();
        
        // Move to next step
        if (activeStep < onboardingSteps.length - 1) {
          setActiveStep(activeStep + 1);
        }
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de compléter l'étape",
        variant: "destructive"
      });
    }
  };

  const navigateToProfile = () => {
    // Navigate to profile page
    window.location.href = '/profile';
  };

  const navigateToDeposit = () => {
    // Navigate to deposit page
    window.location.href = '/deposit';
  };

  const navigateToLottery = () => {
    // Navigate to lottery page
    window.location.href = '/lottery';
  };

  const navigateToReferral = () => {
    // Navigate to referral page
    window.location.href = '/referral';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Zap className="w-8 h-8 animate-pulse text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Guide de Démarrage</h2>
            <p className="text-blue-100">Suivez ces étapes pour maximiser vos gains</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{progress?.completionPercentage || 0}%</div>
            <div className="text-sm text-blue-100">Progression</div>
          </div>
        </div>
        
        {progress && (
          <div className="mt-4">
            <Progress 
              value={progress.completionPercentage} 
              className="h-2 bg-blue-400"
            />
            <div className="flex justify-between text-sm text-blue-100 mt-2">
              <span>{progress.completedSteps.length} / {progress.totalSteps} étapes</span>
              <span>Bonus gagné: {progress.bonusEarned}₪</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{progress?.bonusEarned || 0}₪</div>
            <div className="text-sm text-gray-600">Bonus Gagnés</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{progress?.completedSteps.length || 0}</div>
            <div className="text-sm text-gray-600">Étapes Complétées</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-sm font-bold text-purple-600">{progress?.nextReward || '50₪ bonus'}</div>
            <div className="text-sm text-gray-600">Prochaine Récompense</div>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Steps */}
      <div className="space-y-4">
        {onboardingSteps.map((step, index) => (
          <Card key={step.id} className={`
            transition-all duration-200
            ${step.completed ? 'bg-green-50 border-green-200' : 
              index === activeStep ? 'bg-blue-50 border-blue-200 shadow-md' : 
              'bg-gray-50 border-gray-200'}
          `}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`
                    p-3 rounded-full
                    ${step.completed ? 'bg-green-500 text-white' : 
                      index === activeStep ? 'bg-blue-500 text-white' : 
                      'bg-gray-300 text-gray-600'}
                  `}>
                    {step.completed ? <CheckCircle className="w-6 h-6" /> : step.icon}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold flex items-center">
                      {step.title}
                      {step.completed && (
                        <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                          Complété
                        </Badge>
                      )}
                      {index === activeStep && !step.completed && (
                        <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                          En cours
                        </Badge>
                      )}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                    {step.reward && (
                      <div className="flex items-center mt-2">
                        <Gift className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium text-yellow-600">
                          Récompense: {step.reward}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {step.completed ? (
                    <div className="text-green-600 font-medium">
                      Terminé
                    </div>
                  ) : index === activeStep ? (
                    <div className="space-x-2">
                      {step.action && (
                        <Button onClick={step.action} variant="outline">
                          Commencer
                        </Button>
                      )}
                      <Button 
                        onClick={() => completeStep(step.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Marquer comme fait
                      </Button>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      En attente
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completion Celebration */}
      {progress?.completionPercentage === 100 && (
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <CardContent className="p-6 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Félicitations !</h2>
            <p className="text-lg mb-4">
              Vous avez complété votre intégration et gagné {progress.bonusEarned}₪ de bonus !
            </p>
            <Badge variant="secondary" className="bg-white text-orange-600 text-lg px-4 py-2">
              Statut VIP Temporaire Activé
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}