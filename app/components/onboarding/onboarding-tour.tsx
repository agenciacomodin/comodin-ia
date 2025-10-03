
'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface OnboardingStep {
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: '¡Bienvenido a COMODÍN IA! 🎉',
    description: 'Te guiaremos a través de las funcionalidades principales de la plataforma.',
    target: 'body',
    position: 'bottom'
  },
  {
    title: 'Bandeja de Entrada 💬',
    description: 'Aquí encontrarás todas tus conversaciones de WhatsApp en tiempo real.',
    target: '[data-tour="inbox"]',
    position: 'right'
  },
  {
    title: 'Gestión de Contactos 👥',
    description: 'Administra tus contactos, añade etiquetas y notas internas.',
    target: '[data-tour="contacts"]',
    position: 'right'
  },
  {
    title: 'Campañas de Marketing 📢',
    description: 'Crea campañas masivas de WhatsApp con segmentación avanzada.',
    target: '[data-tour="campaigns"]',
    position: 'right'
  },
  {
    title: 'Base de Conocimiento 🧠',
    description: 'Sube documentos para que la IA aprenda y responda automáticamente.',
    target: '[data-tour="knowledge"]',
    position: 'right'
  },
  {
    title: 'Cartera de IA 💰',
    description: 'Gestiona tus créditos para usar las funcionalidades de IA.',
    target: '[data-tour="wallet"]',
    position: 'right'
  },
  {
    title: '¡Listo para empezar! ✨',
    description: 'Ya conoces lo básico. Explora la plataforma y descubre más funcionalidades.',
    target: 'body',
    position: 'bottom'
  }
];

export function OnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    if (!completed) {
      setTimeout(() => setIsActive(true), 1000);
    } else {
      setHasCompletedOnboarding(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsActive(false);
    setHasCompletedOnboarding(true);
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  if (!isActive || hasCompletedOnboarding) return null;

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm" />
      
      {/* Onboarding Card */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md px-4">
        <Card className="border-2 border-primary shadow-2xl">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {currentStep + 1}
                </div>
                <span className="text-sm text-muted-foreground">
                  de {onboardingSteps.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={skipOnboarding}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress */}
            <Progress value={progress} className="mb-6" />

            {/* Content */}
            <div className="space-y-4 mb-6">
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>

              {currentStep < onboardingSteps.length - 1 ? (
                <Button onClick={handleNext} className="gap-2">
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={completeOnboarding} className="gap-2">
                  <Check className="h-4 w-4" />
                  ¡Entendido!
                </Button>
              )}
            </div>

            {/* Skip */}
            <div className="text-center mt-4">
              <button
                onClick={skipOnboarding}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Saltar tutorial
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
