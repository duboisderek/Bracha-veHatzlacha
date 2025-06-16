import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HebrewTestPage() {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    amount: 100
  });

  // Force Hebrew on page load
  useEffect(() => {
    if (language !== 'he') {
      setLanguage('he');
    }
  }, [language, setLanguage]);

  // Test translation functionality
  const testTranslations = () => {
    const results: string[] = [];
    const testKeys = [
      'appName',
      'home',
      'login',
      'selectNumbers',
      'currentBalance',
      'nextDraw',
      'participationAmount',
      'clientLogin'
    ];

    testKeys.forEach(key => {
      try {
        const translation = t(key as any);
        if (translation && translation !== key) {
          results.push(`✓ ${key}: ${translation}`);
        } else {
          results.push(`❌ ${key}: Translation missing or fallback`);
        }
      } catch (error) {
        results.push(`❌ ${key}: Error - ${error}`);
      }
    });

    setTestResults(results);
  };

  // Test number selection (lottery functionality)
  const selectNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(prev => prev.filter(n => n !== num));
    } else if (selectedNumbers.length < 6) {
      setSelectedNumbers(prev => [...prev, num]);
    }
  };

  // Test form functionality
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Hebrew form submitted:', formData);
    alert(`טופס נשלח: ${formData.email}, סכום: ₪${formData.amount}`);
  };

  return (
    <div className={`min-h-screen p-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-600">
              {t('appName')}
            </CardTitle>
            <CardDescription>
              בדיקת פונקציונליות עברית - {new Date().toLocaleDateString('he-IL')}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Language & RTL Status */}
        <Card>
          <CardHeader>
            <CardTitle>סטטוס שפה וכיוון</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded">
                <strong>שפה נוכחית:</strong> {language}
              </div>
              <div className="p-3 bg-green-50 rounded">
                <strong>כיוון RTL:</strong> {isRTL ? 'פעיל' : 'לא פעיל'}
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <strong>כיוון DOM:</strong> {document.documentElement.dir}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Translation Test */}
        <Card>
          <CardHeader>
            <CardTitle>בדיקת תרגומים</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testTranslations} className="mb-4">
              בדוק תרגומים
            </Button>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded text-sm ${result.startsWith('✓') ? 'bg-green-100' : 'bg-red-100'}`}
                >
                  {result}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Number Selection Test */}
        <Card>
          <CardHeader>
            <CardTitle>{t('selectNumbers')} (1-37)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 mb-4">
              {Array.from({ length: 37 }, (_, i) => i + 1).map(num => (
                <Button
                  key={num}
                  variant={selectedNumbers.includes(num) ? "default" : "outline"}
                  className={`w-10 h-10 p-0 ${
                    selectedNumbers.includes(num) 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'hover:bg-blue-50'
                  }`}
                  onClick={() => selectNumber(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
            <div className="p-3 bg-blue-50 rounded">
              <strong>מספרים נבחרים:</strong> {
                selectedNumbers.length > 0 
                  ? selectedNumbers.sort((a, b) => a - b).join(', ')
                  : 'אין'
              } ({selectedNumbers.length}/6)
            </div>
          </CardContent>
        </Card>

        {/* Form Test */}
        <Card>
          <CardHeader>
            <CardTitle>בדיקת טפסים</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  כתובת דוא"ל:
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="הכנס כתובת דוא״ל"
                  className="text-right"
                  dir="rtl"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('participationAmount')}:
                </label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  min="100"
                  step="100"
                  className="text-right"
                  dir="rtl"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                שלח טופס
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Console Test */}
        <Card>
          <CardHeader>
            <CardTitle>בדיקות טכניות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => {
                  console.log('Hebrew test - Language context:', { language, isRTL });
                  console.log('Hebrew test - DOM direction:', document.documentElement.dir);
                  console.log('Hebrew test - HTML lang:', document.documentElement.lang);
                  alert('בדיקה נשלחה לקונסול');
                }}
                variant="outline"
              >
                בדוק קונסול
              </Button>
              
              <Button
                onClick={() => {
                  const testText = 'בדיקת קלט עברית: שלום עולם';
                  navigator.clipboard.writeText(testText).then(() => {
                    alert('טקסט עברית הועתק ללוח');
                  });
                }}
                variant="outline"
              >
                בדוק העתקה
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Test */}
        <Card>
          <CardHeader>
            <CardTitle>בדיקת ניווט</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                {t('home')}
              </Button>
              
              <Button
                onClick={() => window.location.href = '/personal'}
                variant="outline"
              >
                אזור אישי
              </Button>
              
              <Button
                onClick={() => window.location.href = '/chat'}
                variant="outline"
              >
                {t('chat')}
              </Button>
              
              <Button
                onClick={() => window.location.href = '/client-auth'}
                variant="outline"
              >
                {t('clientLogin')}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}