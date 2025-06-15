import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Trophy, 
  CreditCard, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PrizeClaimingGuideProps {
  winningAmount: number;
  drawNumber: number;
  matchCount: number;
  isVisible?: boolean;
  onClose?: () => void;
  className?: string;
}

export function PrizeClaimingGuide({ 
  winningAmount, 
  drawNumber, 
  matchCount,
  isVisible = false,
  onClose,
  className = "" 
}: PrizeClaimingGuideProps) {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);

  const config = {
    prizeClaiming: {
      methods: ['bank_transfer', 'cash_pickup', 'check'],
      minimumForBankTransfer: 1000,
      processingDays: 3,
      requiredDocuments: ['id_copy', 'bank_details'],
      contactMethods: {
        phone: '+972501234567',
        email: 'prizes@brachavehatzlacha.com',
        office: 'Tel Aviv Office - By appointment only'
      }
    }
  };

  const claimingSteps = [
    {
      id: 1,
      title: language === 'he' ? 'אישור זכייה' : 'Confirm Your Win',
      description: language === 'he' ? 
        'אשר את פרטי הזכייה שלך ושמור את מספר ההגרלה' : 
        'Confirm your winning details and save your draw number',
      icon: Trophy,
      required: true
    },
    {
      id: 2,
      title: language === 'he' ? 'בחירת אמצעי תשלום' : 'Choose Payment Method',
      description: language === 'he' ? 
        'בחר כיצד תרצה לקבל את הפרס שלך' : 
        'Choose how you would like to receive your prize',
      icon: CreditCard,
      required: true
    },
    {
      id: 3,
      title: language === 'he' ? 'הגשת מסמכים' : 'Submit Documents',
      description: language === 'he' ? 
        'הגש את המסמכים הנדרשים לאישור זהות' : 
        'Submit required documents for identity verification',
      icon: FileText,
      required: true
    },
    {
      id: 4,
      title: language === 'he' ? 'עיבוד הפרס' : 'Prize Processing',
      description: language === 'he' ? 
        'הפרס שלך יעובד תוך 3 ימי עסקים' : 
        'Your prize will be processed within 3 business days',
      icon: Clock,
      required: false
    }
  ];

  const paymentMethods = [
    {
      id: 'bank_transfer',
      name: language === 'he' ? 'העברה בנקאית' : 'Bank Transfer',
      description: language === 'he' ? 
        'זמין לפרסים מעל ₪1000' : 
        'Available for prizes over ₪1000',
      available: winningAmount >= config.prizeClaiming.minimumForBankTransfer,
      processingTime: '1-2 business days'
    },
    {
      id: 'cash_pickup',
      name: language === 'he' ? 'איסוף במזומן' : 'Cash Pickup',
      description: language === 'he' ? 
        'איסוף אישי במשרדים בתיאום מראש' : 
        'Personal pickup at our office by appointment',
      available: true,
      processingTime: 'Same day'
    },
    {
      id: 'check',
      name: language === 'he' ? 'המחאה' : 'Check',
      description: language === 'he' ? 
        'המחאה תישלח לכתובת שלך' : 
        'Check will be mailed to your address',
      available: true,
      processingTime: '5-7 business days'
    }
  ];

  const requiredDocuments = [
    {
      id: 'id_copy',
      name: language === 'he' ? 'צילום תעודת זהות' : 'ID Copy',
      description: language === 'he' ? 
        'צילום ברור של תעודת זהות בתוקף' : 
        'Clear copy of valid ID document'
    },
    {
      id: 'bank_details',
      name: language === 'he' ? 'פרטי חשבון בנק' : 'Bank Details',
      description: language === 'he' ? 
        'פרטי חשבון בנק לביצוע ההעברה' : 
        'Bank account details for transfer'
    }
  ];

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <Card className={`bg-white dark:bg-gray-900 ${className}`}>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <CardTitle className="text-2xl font-bold">
                {language === 'he' ? 'מזל טוב! זכית!' : 'Congratulations! You Won!'}
              </CardTitle>
            </div>
            
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-600">
                ₪{winningAmount.toLocaleString()}
              </div>
              <div className="text-lg text-gray-600">
                {language === 'he' ? 'הגרלה מס׳' : 'Draw #'}{drawNumber} • {matchCount} {language === 'he' ? 'מספרים נכונים' : 'correct numbers'}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Steps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {language === 'he' ? 'תהליך קבלת הפרס' : 'Prize Claiming Process'}
              </h3>
              
              <div className="space-y-3">
                {claimingSteps.map((step, index) => (
                  <div 
                    key={step.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      currentStep >= step.id 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      currentStep > step.id 
                        ? 'bg-green-500 text-white' 
                        : currentStep === step.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {currentStep > step.id ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                    
                    {step.required && (
                      <Badge variant="outline" className="text-xs">
                        {language === 'he' ? 'נדרש' : 'Required'}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {language === 'he' ? 'אמצעי תשלום זמינים' : 'Available Payment Methods'}
              </h3>
              
              <div className="grid gap-3">
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id}
                    className={`p-4 rounded-lg border ${
                      method.available 
                        ? 'border-blue-200 bg-blue-50 cursor-pointer hover:bg-blue-100' 
                        : 'border-gray-200 bg-gray-50 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{method.name}</h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          {language === 'he' ? 'זמן עיבוד' : 'Processing time'}: {method.processingTime}
                        </p>
                      </div>
                      
                      {!method.available && (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {language === 'he' ? 'מסמכים נדרשים' : 'Required Documents'}
              </h3>
              
              <div className="space-y-2">
                {requiredDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">{doc.name}</h4>
                      <p className="text-sm text-gray-600">{doc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {language === 'he' ? 'פרטי התקשרות' : 'Contact Information'}
              </h3>
              
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Phone className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">{language === 'he' ? 'טלפון' : 'Phone'}</p>
                    <p className="text-sm text-gray-600">{config.prizeClaiming.contactMethods.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{language === 'he' ? 'אימייל' : 'Email'}</p>
                    <p className="text-sm text-gray-600">{config.prizeClaiming.contactMethods.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium">{language === 'he' ? 'משרד' : 'Office'}</p>
                    <p className="text-sm text-gray-600">{config.prizeClaiming.contactMethods.office}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={() => window.open(`tel:${config.prizeClaiming.contactMethods.phone}`)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Phone className="w-4 h-4 mr-2" />
                {language === 'he' ? 'התקשר עכשיו' : 'Call Now'}
              </Button>
              
              <Button 
                onClick={() => window.open(`mailto:${config.prizeClaiming.contactMethods.email}`)}
                variant="outline" 
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                {language === 'he' ? 'שלח אימייל' : 'Send Email'}
              </Button>
              
              {onClose && (
                <Button onClick={onClose} variant="outline">
                  {language === 'he' ? 'סגור' : 'Close'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}