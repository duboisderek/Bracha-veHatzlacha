import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Phone, Shield, Bell, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';

interface PhoneNumberCollectionProps {
  userId: string;
  currentPhone?: string;
  onPhoneUpdated?: (phone: string) => void;
  className?: string;
}

export function PhoneNumberCollection({ 
  userId, 
  currentPhone, 
  onPhoneUpdated,
  className = "" 
}: PhoneNumberCollectionProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState(currentPhone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(!!currentPhone);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Israeli phone number format
    if (digits.startsWith('972')) {
      // International format: +972-XX-XXX-XXXX
      if (digits.length <= 12) {
        return '+' + digits.replace(/(\d{3})(\d{2})(\d{3})(\d{4})/, '$1-$2-$3-$4');
      }
    } else if (digits.startsWith('0')) {
      // Local format: 0XX-XXX-XXXX
      if (digits.length <= 10) {
        return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
      }
    }
    
    return value;
  };

  const validatePhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    
    // Israeli phone validation
    if (digits.startsWith('972')) {
      return digits.length === 12; // +972XXXXXXXXX
    } else if (digits.startsWith('0')) {
      return digits.length === 10; // 0XXXXXXXXX
    }
    
    return false;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: language === 'he' ? 'שגיאה' : 'Error',
        description: language === 'he' ? 
          'אנא הזן מספר טלפון תקין' : 
          'Please enter a valid phone number',
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('PUT', `/api/users/${userId}/phone`, {
        phoneNumber: phoneNumber
      });

      setIsVerified(true);
      onPhoneUpdated?.(phoneNumber);
      
      toast({
        title: language === 'he' ? 'הצלחה' : 'Success',
        description: language === 'he' ? 
          'מספר הטלפון נשמר בהצלחה' : 
          'Phone number saved successfully',
      });
    } catch (error) {
      toast({
        title: language === 'he' ? 'שגיאה' : 'Error',
        description: language === 'he' ? 
          'שגיאה בשמירת מספר הטלפון' : 
          'Error saving phone number',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          {language === 'he' ? 'מספר טלפון להתראות' : 'Phone Number for Notifications'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isVerified ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <Check className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-800">
                {language === 'he' ? 'מספר טלפון מאומת' : 'Phone Number Verified'}
              </p>
              <p className="text-sm text-green-600">{phoneNumber}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsVerified(false)}
            >
              {language === 'he' ? 'עריכה' : 'Edit'}
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                {language === 'he' ? 'מספר טלפון נייד' : 'Mobile Phone Number'}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder={language === 'he' ? '050-123-4567 או +972-50-123-4567' : '050-123-4567 or +972-50-123-4567'}
                value={phoneNumber}
                onChange={handlePhoneChange}
                className={language === 'he' ? 'text-right' : 'text-left'}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">
                    {language === 'he' ? 'התראות SMS' : 'SMS Notifications'}
                  </p>
                  <p className="text-blue-600">
                    {language === 'he' ? 
                      'תקבל התראות על תחילת הגרלות וזכיות' : 
                      'Receive notifications about draw starts and winnings'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">
                    {language === 'he' ? 'פרטיות ואבטחה' : 'Privacy & Security'}
                  </p>
                  <p className="text-amber-600">
                    {language === 'he' ? 
                      'מספר הטלפון שלך מוגן ולא יועבר לצדדים שלישיים' : 
                      'Your phone number is protected and will not be shared with third parties'}
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !phoneNumber}
              className="w-full"
            >
              {isSubmitting ? 
                (language === 'he' ? 'שומר...' : 'Saving...') : 
                (language === 'he' ? 'שמור מספר טלפון' : 'Save Phone Number')
              }
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            {language === 'he' ? 
              'פורמטים נתמכים: 050-123-4567, +972-50-123-4567' : 
              'Supported formats: 050-123-4567, +972-50-123-4567'}
          </p>
          <p>
            {language === 'he' ? 
              'תעריפי SMS רגילים עשויים לחול' : 
              'Standard SMS rates may apply'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}