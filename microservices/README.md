# Reservei Viagens - Arquitetura de Microserviços

## 🏗️ Visão Geral da Arquitetura

Sistema distribuído baseado em microserviços para alta escalabilidade e disponibilidade, permitindo crescimento horizontal e isolamento de falhas.

## 🎯 Microserviços Principais

### 1. **API Gateway** (`gateway-service`)
- **Responsabilidade**: Roteamento, autenticação, rate limiting
- **Tecnologia**: Node.js + Express + Kong
- **Porta**: 3000
- **Endpoints**: `/api/*`

### 2. **Serviço de Usuários** (`user-service`)
- **Responsabilidade**: Gestão de usuários, perfis, autenticação
- **Tecnologia**: Node.js + Prisma + PostgreSQL
- **Porta**: 3001
- **Endpoints**: `/users/*`, `/auth/*`

### 3. **Serviço de Hotéis** (`hotel-service`)
- **Responsabilidade**: Gestão de hotéis, quartos, disponibilidade
- **Tecnologia**: Node.js + Prisma + PostgreSQL
- **Porta**: 3002
- **Endpoints**: `/hotels/*`, `/rooms/*`

### 4. **Serviço de Reservas** (`booking-service`)
- **Responsabilidade**: Processamento de reservas, pagamentos
- **Tecnologia**: Node.js + Prisma + PostgreSQL + Redis
- **Porta**: 3003
- **Endpoints**: `/bookings/*`, `/payments/*`

### 5. **Serviço de Gamificação** (`gamification-service`)
- **Responsabilidade**: Sistema de pontos, missões, achievements
- **Tecnologia**: Node.js + Prisma + PostgreSQL + Redis
- **Porta**: 3004
- **Endpoints**: `/missions/*`, `/points/*`

### 6. **Serviço de Notificações** (`notification-service`)
- **Responsabilidade**: Email, SMS, push notifications
- **Tecnologia**: Node.js + Redis + RabbitMQ
- **Porta**: 3005
- **Endpoints**: `/notifications/*`

### 7. **Serviço de Analytics** (`analytics-service`)
- **Responsabilidade**: Coleta e análise de dados
- **Tecnologia**: Node.js + ClickHouse + Redis
- **Porta**: 3006
- **Endpoints**: `/analytics/*`

### 8. **Serviço de IA** (`ai-service`)
- **Responsabilidade**: Chatbot, recomendações, ML
- **Tecnologia**: Python + FastAPI + TensorFlow
- **Porta**: 3007
- **Endpoints**: `/ai/*`, `/recommendations/*`

## 🔧 Tecnologias de Infraestrutura

### **Containerização**
- **Docker**: Containerização de aplicações
- **Docker Compose**: Orquestração local
- **Kubernetes**: Orquestração em produção

### **Service Discovery**
- **Consul**: Descoberta de serviços
- **Etcd**: Configuração distribuída

### **Load Balancing**
- **HAProxy**: Load balancer
- **Nginx**: Reverse proxy
- **Kong**: API Gateway

### **Message Queue**
- **RabbitMQ**: Mensageria assíncrona
- **Redis**: Cache e sessões
- **Apache Kafka**: Stream processing

### **Monitoramento**
- **Prometheus**: Métricas
- **Grafana**: Dashboards
- **Jaeger**: Distributed tracing
- **ELK Stack**: Logs

## 📊 Arquitetura de Dados

### **Databases**
- **PostgreSQL**: Dados transacionais
- **MongoDB**: Dados não estruturados
- **Redis**: Cache e sessões
- **ClickHouse**: Analytics

### **Data Consistency**
- **Saga Pattern**: Transações distribuídas
- **Event Sourcing**: Auditoria de eventos
- **CQRS**: Separação de leitura/escrita

## 🚀 Deploy e Escalabilidade

### **Deploy Strategy**
```yaml
# docker-compose.yml
version: '3.8'
services:
  api-gateway:
    image: reservei/gateway-service
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  user-service:
    image: reservei/user-service
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/users
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

  hotel-service:
    image: reservei/hotel-service
    ports:
      - "3002:3002"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/hotels
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

  booking-service:
    image: reservei/booking-service
    ports:
      - "3003:3003"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/bookings
      - REDIS_URL=redis://redis:6379
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1.5'
          memory: 2G

  gamification-service:
    image: reservei/gamification-service
    ports:
      - "3004:3004"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/gamification
      - REDIS_URL=redis://redis:6379
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  notification-service:
    image: reservei/notification-service
    ports:
      - "3005:3005"
    environment:
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://rabbitmq:5672
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  analytics-service:
    image: reservei/analytics-service
    ports:
      - "3006:3006"
    environment:
      - CLICKHOUSE_URL=http://clickhouse:8123
      - REDIS_URL=redis://redis:6379
    deploy:
      replicas: 1
      resources:
        limits:
          cpus: '2.0'
          memory: 4G

  ai-service:
    image: reservei/ai-service
    ports:
      - "3007:3007"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2.0'
          memory: 4G

  # Infraestrutura
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    deploy:
      replicas: 1
      resources:
        limits:
          cpus: '2.0'
          memory: 4G

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    deploy:
      replicas: 1
      resources:
        limits:
          cpus: '1.0'
          memory: 2G

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    deploy:
      replicas: 1
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  clickhouse:
    image: clickhouse/clickhouse-server:latest
    ports:
      - "8123:8123"
      - "9000:9000"
    deploy:
      replicas: 1
      resources:
        limits:
          cpus: '2.0'
          memory: 4G

volumes:
  postgres_data:
```

## 🔄 Comunicação entre Serviços

### **Síncrona (HTTP/REST)**
```typescript
// Exemplo: Booking Service chamando Hotel Service
async function checkAvailability(hotelId: string, dates: DateRange) {
  const response = await fetch(`http://hotel-service:3002/hotels/${hotelId}/availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dates })
  });
  return response.json();
}
```

### **Assíncrona (Eventos)**
```typescript
// Exemplo: Booking Service publicando evento
async function createBooking(bookingData: BookingData) {
  const booking = await saveBooking(bookingData);
  
  // Publicar evento
  await publishEvent('booking.created', {
    bookingId: booking.id,
    userId: booking.userId,
    amount: booking.amount,
    timestamp: new Date()
  });
  
  return booking;
}

// Notification Service consumindo evento
async function handleBookingCreated(event: BookingCreatedEvent) {
  const user = await getUserService.getUser(event.userId);
  await sendEmail(user.email, 'booking-confirmation', {
    bookingId: event.bookingId,
    amount: event.amount
  });
}
```

## 📈 Estratégias de Escalabilidade

### **Horizontal Scaling**
- **Auto-scaling** baseado em CPU/memória
- **Load balancing** com health checks
- **Database sharding** por região

### **Vertical Scaling**
- **Resource limits** configuráveis
- **Memory optimization** por serviço
- **CPU allocation** baseada em demanda

### **Caching Strategy**
- **Redis Cluster** para cache distribuído
- **CDN** para assets estáticos
- **Database caching** com Redis

## 🔍 Monitoramento e Observabilidade

### **Métricas**
```typescript
// Prometheus metrics
import { register, Counter, Histogram } from 'prom-client';

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const bookingCounter = new Counter({
  name: 'bookings_total',
  help: 'Total number of bookings',
  labelNames: ['status', 'hotel_id']
});
```

### **Distributed Tracing**
```typescript
// Jaeger tracing
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('booking-service');

async function createBooking(data: BookingData) {
  const span = tracer.startSpan('create-booking');
  
  try {
    const booking = await processBooking(data);
    span.setStatus({ code: SpanStatusCode.OK });
    return booking;
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    throw error;
  } finally {
    span.end();
  }
}
```

## 🚀 Deploy em Produção

### **Kubernetes**
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: booking-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: booking-service
  template:
    metadata:
      labels:
        app: booking-service
    spec:
      containers:
      - name: booking-service
        image: reservei/booking-service:latest
        ports:
        - containerPort: 3003
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3003
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3003
          initialDelaySeconds: 5
          periodSeconds: 5
```

### **CI/CD Pipeline**
```yaml
# .github/workflows/microservices-deploy.yml
name: Deploy Microservices

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Build Docker images
      run: |
        docker build -t reservei/gateway-service ./gateway-service
        docker build -t reservei/user-service ./user-service
        docker build -t reservei/hotel-service ./hotel-service
        docker build -t reservei/booking-service ./booking-service
        docker build -t reservei/gamification-service ./gamification-service
        docker build -t reservei/notification-service ./notification-service
        docker build -t reservei/analytics-service ./analytics-service
        docker build -t reservei/ai-service ./ai-service
    
    - name: Push to registry
      run: |
        docker push reservei/gateway-service
        docker push reservei/user-service
        docker push reservei/hotel-service
        docker push reservei/booking-service
        docker push reservei/gamification-service
        docker push reservei/notification-service
        docker push reservei/analytics-service
        docker push reservei/ai-service
    
    - name: Deploy to Kubernetes
      run: |
        kubectl apply -f k8s/
        kubectl rollout restart deployment/booking-service
```

## 📊 Performance e Benchmarks

### **Targets de Performance**
- **Latência**: < 200ms para 95% das requisições
- **Throughput**: 10,000 req/s por serviço
- **Uptime**: 99.9% disponibilidade
- **Error Rate**: < 0.1% de erros

### **Load Testing**
```bash
# Teste de carga com Artillery
artillery run load-test.yml

# Configuração do teste
config:
  target: 'http://api-gateway:3000'
  phases:
    - duration: 60
      arrivalRate: 100
    - duration: 300
      arrivalRate: 500
    - duration: 60
      arrivalRate: 1000
```

## 🔒 Segurança

### **Service-to-Service Security**
- **mTLS** para comunicação entre serviços
- **JWT tokens** para autenticação
- **API keys** para serviços externos
- **Rate limiting** por serviço

### **Data Security**
- **Encryption at rest** para databases
- **Encryption in transit** com TLS 1.3
- **Secrets management** com HashiCorp Vault
- **Audit logging** para todas as operações

## 📈 Roadmap de Evolução

### **Fase 1 (Atual)**
- ✅ Arquitetura básica de microserviços
- ✅ Service discovery
- ✅ Load balancing
- ✅ Monitoramento básico

### **Fase 2 (Próxima)**
- 🔄 Auto-scaling avançado
- 🔄 Circuit breakers
- 🔄 Distributed tracing completo
- 🔄 Chaos engineering

### **Fase 3 (Futura)**
- 🔄 Serverless functions
- 🔄 Event-driven architecture
- 🔄 Machine learning pipelines
- 🔄 Edge computing 