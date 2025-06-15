import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, UserPlus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface SimpleUserCreationProps {
  onUserCreated?: (user: any) => void;
  isAdminCreation?: boolean;
  className?: string;
}

export function SimpleUserCreation({ 
  onUserCreated, 
  isAdminCreation = false,
  className = "" 
}: SimpleUserCreationProps) {
  const [username, setUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const generateUserId = (username: string) => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `user_${username.toLowerCase().replace(/[^a-z0-9]/g, '')}_${timestamp}_${random}`;
  };

  const generateReferralCode = (username: string) => {
    const code = username.toUpperCase().substr(0, 4) + Math.random().toString(36).substr(2, 4).toUpperCase();
    return code;
  };

  const handleCreateUser = async () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }

    if (username.length < 3) {
      toast({
        title: "Error",
        description: "Username must be at least 3 characters",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const userData = {
        id: generateUserId(username),
        firstName: username,
        lastName: "",
        email: `${username.toLowerCase()}@brachavehatzlacha.com`,
        referralCode: generateReferralCode(username),
        balance: "1000.00",
        totalWinnings: "0.00",
        referralBonus: "0.00",
        referralCount: 0,
        language: language,
        phoneNumber: null,
        profileImageUrl: null,
        isBlocked: false,
        createdViaSimpleSystem: true
      };

      const endpoint = isAdminCreation ? '/api/admin/create-simple-user' : '/api/auth/simple-register';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      const createdUser = await response.json();
      
      toast({
        title: "Success",
        description: `User created: ${username}`,
      });

      setUsername("");
      onUserCreated?.(createdUser);

    } catch (error) {
      console.error('User creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateUser();
    }
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          {isAdminCreation ? "Create New User" : "Join Lottery"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">
            Username
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
              disabled={isCreating}
              maxLength={20}
            />
          </div>
          <p className="text-xs text-gray-500">
            Choose a unique username (3-20 characters)
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleCreateUser}
            disabled={isCreating || !username.trim()}
            className="w-full"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </div>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                {isAdminCreation ? "Create User" : "Join Now"}
              </>
            )}
          </Button>
        </motion.div>

        {!isAdminCreation && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Simple registration with username only - no email or password required
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}