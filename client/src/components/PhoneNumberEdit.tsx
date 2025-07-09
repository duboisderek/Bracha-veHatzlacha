import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Check, X, AlertCircle } from "lucide-react";

interface PhoneNumberEditProps {
  currentPhone?: string;
  onUpdate: (newPhone: string) => void;
}

export function PhoneNumberEdit({ currentPhone = "", onUpdate }: PhoneNumberEditProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newPhone, setNewPhone] = useState(currentPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleStartEdit = () => {
    setIsEditing(true);
    setNewPhone(currentPhone);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewPhone(currentPhone);
    setIsVerifying(false);
    setVerificationCode("");
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Support for international phone numbers
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const handleSendVerification = async () => {
    if (!newPhone.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un numéro de téléphone",
        variant: "destructive"
      });
      return;
    }

    if (!validatePhoneNumber(newPhone)) {
      toast({
        title: "Erreur",
        description: "Format de numéro de téléphone invalide",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/phone/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: newPhone })
      });

      if (response.ok) {
        setIsVerifying(true);
        toast({
          title: "Code envoyé",
          description: "Un code de vérification a été envoyé à votre numéro",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Erreur lors de l'envoi du code",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndUpdate = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer le code de vérification",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/phone/verify-and-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          phone: newPhone, 
          verificationCode 
        })
      });

      if (response.ok) {
        onUpdate(newPhone);
        setIsEditing(false);
        setIsVerifying(false);
        setVerificationCode("");
        toast({
          title: "Succès",
          description: "Numéro de téléphone mis à jour avec succès",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          description: errorData.message || "Code de vérification invalide",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Numéro de téléphone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">
                {currentPhone || "Aucun numéro configuré"}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleStartEdit}
            >
              {currentPhone ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {!isVerifying ? (
              <>
                <div>
                  <Label htmlFor="newPhone">Nouveau numéro de téléphone</Label>
                  <Input
                    id="newPhone"
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format international recommandé (ex: +33612345678)
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendVerification}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "Envoi..." : "Envoyer code de vérification"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <AlertCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-blue-700">
                    Code de vérification envoyé à <strong>{newPhone}</strong>
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="verificationCode">Code de vérification</Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="mt-1 text-center text-lg font-mono"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleVerifyAndUpdate}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {isLoading ? "Vérification..." : "Vérifier et sauvegarder"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleSendVerification}
                    disabled={isLoading}
                    className="text-blue-600"
                  >
                    Renvoyer le code
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}