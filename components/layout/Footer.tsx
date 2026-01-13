"use client";

import { useCallback, useRef } from "react";
import { Heart, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const clickTimeRef = useRef<number>(0);

  /**
   * Hybrid contact handler for PWA compatibility
   * يحاول فتح تطبيق البريد أولاً، ثم Gmail Web كبديل
   * 
   * Strategy:
   * 1. Record click time and attempt mailto:
   * 2. After 500ms, check if page is still visible (mailto failed)
   * 3. If still here, open Gmail Web as fallback
   */
  const handleContactClick = useCallback(() => {
    const email = "mallemdevs@gmail.com";
    const subject = "ملاحظة أو تصحيح بخصوص محتوى قانوني";
    const encodedSubject = encodeURIComponent(subject);
    
    // Record when we clicked
    clickTimeRef.current = Date.now();
    
    // Attempt mailto first
    const mailtoUrl = `mailto:${email}?subject=${encodedSubject}`;
    window.location.href = mailtoUrl;
    
    // Fallback: If mailto doesn't work (PWA/mobile), open Gmail Web
    setTimeout(() => {
      // If we're still on the same page after 500ms, mailto likely failed
      // Check that not too much time has passed (user might have switched apps)
      const elapsed = Date.now() - clickTimeRef.current;
      if (elapsed >= 400 && elapsed < 2000 && document.visibilityState === "visible") {
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodedSubject}`;
        window.open(gmailUrl, "_blank", "noopener,noreferrer");
      }
    }, 500);
  }, []);

  return (
    <footer className="border-t border-border bg-background py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          {/* Contact & Feedback Notice */}
          <div className="max-w-xl text-sm text-muted-foreground leading-relaxed">
            <p>
              إذا واجهتم أي إشكال، أو كانت لديكم ملاحظة، أو لاحظتم خطأً مطبعيًا غير مقصود
              <br />
              في مادة أو نص قانوني، يسعدنا تواصلكم معنا.
            </p>
            <button 
              type="button"
              onClick={handleContactClick}
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/50 hover:bg-muted border border-border rounded-lg transition-colors cursor-pointer"
              aria-label="التواصل معنا عبر البريد الإلكتروني"
            >
              <Mail className="h-4 w-4" />
              التواصل معنا / الإبلاغ عن ملاحظة
            </button>
          </div>

          <div className="border-t border-border w-full max-w-xs pt-4">
            <p className="text-sm text-muted-foreground">
              قانون المسطرة الجنائية المغربي - القانون رقم 22.01 المعدل بالقانون رقم 03.23
            </p>
          </div>
          
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            صُنع بـ
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            للمحامين والطلاب المغاربة
          </p>
          
          <p className="text-xs text-muted-foreground">
            © {currentYear} قانون دوكس. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
