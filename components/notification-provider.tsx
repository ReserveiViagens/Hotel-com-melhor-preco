'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';

interface NotificationContextType {
  isSupported: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  subscribeToNotifications: () => Promise<PushSubscription | null>;
  unsubscribeFromNotifications: () => Promise<boolean>;
  isSubscribed: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Verificar suporte a notificações
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }

    // Verificar se já está inscrito para push notifications
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Erro ao verificar inscrição:', error);
    }
  };

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      toast({
        title: 'Notificações não suportadas',
        description: 'Seu navegador não suporta notificações.',
        variant: 'destructive',
      });
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: 'Notificações ativadas',
          description: 'Você receberá notificações importantes.',
        });
      } else {
        toast({
          title: 'Notificações negadas',
          description: 'Você pode ativar nas configurações do navegador.',
          variant: 'destructive',
        });
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return 'denied';
    }
  };

  const sendNotification = (title: string, options: NotificationOptions = {}) => {
    if (!isSupported || permission !== 'granted') {
      toast({
        title,
        description: options.body || '',
      });
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        image: options.image,
        body: options.body,
        tag: options.tag || 'reservei-notification',
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        timestamp: Date.now(),
        data: options.data,
        actions: options.actions,
        ...options
      });

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        if (options.data?.url) {
          window.open(options.data.url, '_blank');
        }
        
        notification.close();
      };

      // Auto-close após 5 segundos se não for requireInteraction
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast({
        title,
        description: options.body || '',
      });
    }
  };

  const subscribeToNotifications = async (): Promise<PushSubscription | null> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast({
        title: 'Push notifications não suportadas',
        description: 'Seu navegador não suporta push notifications.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Verificar se já existe uma inscrição
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setIsSubscribed(true);
        return existingSubscription;
      }

      // Criar nova inscrição
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9w6NMzH7g'
        )
      });

      // Enviar inscrição para o servidor
      await fetch('/api/admin/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      });

      setIsSubscribed(true);
      toast({
        title: 'Push notifications ativadas',
        description: 'Você receberá notificações importantes mesmo com o app fechado.',
      });

      return subscription;
    } catch (error) {
      console.error('Erro ao inscrever para push notifications:', error);
      toast({
        title: 'Erro ao ativar notificações',
        description: 'Não foi possível ativar as notificações push.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const unsubscribeFromNotifications = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remover inscrição do servidor
        await fetch('/api/admin/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint
          })
        });
        
        setIsSubscribed(false);
        toast({
          title: 'Notificações desativadas',
          description: 'Você não receberá mais notificações push.',
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao desinscrever:', error);
      return false;
    }
  };

  const value: NotificationContextType = {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    isSubscribed
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Função helper para converter VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
} 