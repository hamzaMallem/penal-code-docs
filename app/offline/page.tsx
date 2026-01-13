"use client";

import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Offline fallback page
 * Shown when the user tries to navigate to a page that isn't cached
 */
export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-muted rounded-full">
            <WifiOff className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-4">
          أنت غير متصل بالإنترنت
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-8">
          يبدو أنك غير متصل بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.
        </p>

        {/* Info about cached content */}
        <div className="bg-muted/50 rounded-lg p-4 mb-8 text-right">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">ملاحظة:</strong> الصفحات التي زرتها سابقاً متاحة بدون إنترنت. 
            جرب العودة للصفحة الرئيسية للوصول إلى المحتوى المحفوظ.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleRetry} variant="default" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
          
          <Button onClick={handleGoHome} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            الصفحة الرئيسية
          </Button>
        </div>

        {/* Technical info */}
        <p className="text-xs text-muted-foreground mt-8">
          قانون دوكس - يعمل بدون إنترنت بعد الزيارة الأولى
        </p>
      </div>
    </div>
  );
}
