"use client";

import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            قانون المسطرة الجنائية المغربي - القانون رقم 22.01 المعدل بالقانون رقم 03.23
          </p>
          
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
