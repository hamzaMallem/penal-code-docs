"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { SearchModal } from "@/components/features/SearchModal";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useState } from "react";
import { Scale, BookOpen, Search, Shield } from "lucide-react";

export default function AboutPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { search } = useGlobalSearch();

  useKeyboardNav({
    onSearchOpen: () => setIsSearchOpen(true),
    onEscape: () => {
      setIsSearchOpen(false);
      setIsSidebarOpen(false);
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onSearchOpen={() => setIsSearchOpen(true)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          navItems={[]}
        />

        <main className="flex-1 sidebar-margin">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <section className="text-center py-12 mb-12">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Scale className="h-16 w-16 text-primary" />
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                حول المنصة
              </h1>

              <p className="text-xl text-muted-foreground">
                موسوعة قانون دوكس
              </p>
            </section>

            {/* Mission */}
            <section className="mb-12">
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    مهمتنا
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  موسوعة قانون دوكس هي منصة رقمية متخصصة في عرض وتصفح النصوص القانونية المغربية،
                  مع التركيز على قانون المسطرة الجنائية ومجموعة القانون الجنائي.
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  تهدف المنصة إلى توفير وصول سهل ومباشر للنصوص القانونية بصيغتها المحيّنة،
                  مما يسهل على الممارسين القانونيين والباحثين والطلاب الاطلاع على التشريعات
                  المغربية بطريقة منظمة وسريعة.
                </p>
              </div>
            </section>

            {/* Legal Context */}
            <section className="mb-12">
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    الإطار القانوني
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  تندرج المنصة في إطار مشروع تحديث تشريعي شامل أقرّه المشرّع المغربي
                  بالقانون رقم 03.23، الذي يهدف إلى تحديث وتطوير المنظومة القانونية
                  والقضائية في المملكة.
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  تعرض المنصة النصوص القانونية بصيغتها المحيّنة، مع مراعاة التعديلات
                  والتغييرات التي أدخلها المشرّع المغربي، مما يضمن للمستخدمين الاطلاع
                  على أحدث النصوص القانونية المعمول بها.
                </p>
              </div>
            </section>

            {/* Features */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">مميزات المنصة</h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Search className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 text-center">
                    بحث ذكي
                  </h3>
                  <p className="text-muted-foreground text-center">
                    نظام بحث متطور يتيح الوصول السريع إلى المواد والفصول القانونية
                  </p>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 text-center">
                    تنقّل مبسّط
                  </h3>
                  <p className="text-muted-foreground text-center">
                    هيكل تنظيمي واضح يسهل التنقل بين الكتب والأبواب والفصول
                  </p>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Scale className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 text-center">
                    قراءة مريحة
                  </h3>
                  <p className="text-muted-foreground text-center">
                    تصميم مريح للعين مع إمكانية التحكم في حجم الخط
                  </p>
                </div>
              </div>
            </section>

            {/* Note */}
            <section className="p-6 rounded-lg border border-border bg-card">
              <p className="text-muted-foreground text-center">
                هذه المنصة أداة مرجعية للنصوص القانونية، ولا تُغني عن الرجوع إلى النصوص الرسمية
                المنشورة في الجريدة الرسمية أو الاستشارة القانونية المتخصصة.
              </p>
            </section>
          </div>

          <Footer />
        </main>
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={search}
        searchScope="global"
      />
    </div>
  );
}
