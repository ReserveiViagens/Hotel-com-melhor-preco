// Service Worker para PWA e Push Notifications
const CACHE_NAME = 'reservei-v1.0.0';
const urlsToCache = [
  '/',
  '/hoteis',
  '/ingressos',
  '/atracoes',
  '/promocoes',
  '/contato',
  '/login',
  '/cadastro',
  '/manifest.json',
  '/logo-reservei.png',
  '/placeholder.jpg',
  '/placeholder-logo.png'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Recursos em cache');
        return self.skipWaiting();
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker ativado');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Ignorar requisições para APIs
  if (event.request.url.includes('/api/')) {
    return;
  }

  // Ignorar requisições para admin
  if (event.request.url.includes('/admin')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retornar do cache se disponível
        if (response) {
          return response;
        }

        // Caso contrário, buscar da rede
        return fetch(event.request)
          .then((response) => {
            // Verificar se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar a resposta
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Fallback para páginas offline
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Escutar push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Reservei Viagens',
    icon: '/logo-reservei.png',
    badge: '/logo-reservei.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Ofertas',
        icon: '/logo-reservei.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/logo-reservei.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Reservei Viagens', options)
  );
});

// Escutar cliques em notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/promocoes')
    );
  } else if (event.action === 'close') {
    // Apenas fechar a notificação
  } else {
    // Clique padrão - abrir a aplicação
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Escutar fechamento de notificações
self.addEventListener('notificationclose', (event) => {
  console.log('Notificação fechada:', event);
  
  // Aqui você pode enviar analytics sobre notificações fechadas
  // fetch('/api/analytics/notification-closed', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     notificationId: event.notification.data?.notificationId,
  //     timestamp: Date.now()
  //   })
  // });
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event);

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Executar tarefas em background
      syncOfflineData()
    );
  }
});

async function syncOfflineData() {
  try {
    // Sincronizar dados offline
    console.log('Executando sincronização em background');
    
    // Sincronizar reservas offline
    const offlineReservations = await getOfflineReservations();
    
    for (const reservation of offlineReservations) {
      await syncReservation(reservation);
    }

    // Sincronizar preferências offline
    const offlinePreferences = await getOfflinePreferences();
    
    for (const preference of offlinePreferences) {
      await syncPreference(preference);
    }

    console.log('Dados offline sincronizados com sucesso');
  } catch (error) {
    console.error('Erro ao sincronizar dados offline:', error);
  }
}

async function getOfflineReservations() {
  // Implementar lógica para buscar reservas salvas offline
  return [];
}

async function syncReservation(reservation) {
  // Implementar lógica para sincronizar reserva
  return true;
}

async function getOfflinePreferences() {
  // Implementar lógica para buscar preferências salvas offline
  return [];
}

async function syncPreference(preference) {
  // Implementar lógica para sincronizar preferência
  return true;
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('Mensagem recebida:', event);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Tratamento de erros
self.addEventListener('error', (event) => {
  console.error('Erro no Service Worker:', event);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejeitada no Service Worker:', event);
});

console.log('Service Worker carregado:', CACHE_NAME); 
console.log('Service Worker carregado:', CACHE_NAME); 