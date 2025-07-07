import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface VoucherData {
  id: string;
  type: 'hotel' | 'attraction' | 'ticket';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  reservationNumber: string;
  hotelName?: string;
  attractionName?: string;
  ticketName?: string;
  checkIn?: string;
  checkOut?: string;
  eventDate?: string;
  eventTime?: string;
  adults?: number;
  children?: number;
  babies?: number;
  totalPrice: number;
  paymentStatus: string;
  specialRequests?: string;
  qrCodeData: string;
  validUntil?: string;
  terms?: string[];
}

export interface PDFTemplate {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  headerHeight: number;
  footerHeight: number;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export const templates: { [key: string]: PDFTemplate } = {
  classic: {
    name: 'Clássico',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    backgroundColor: '#f8fafc',
    textColor: '#1e293b',
    headerHeight: 40,
    footerHeight: 30,
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  },
  modern: {
    name: 'Moderno',
    primaryColor: '#059669',
    secondaryColor: '#047857',
    backgroundColor: '#f0fdf4',
    textColor: '#064e3b',
    headerHeight: 45,
    footerHeight: 35,
    margins: { top: 25, bottom: 25, left: 25, right: 25 },
  },
  minimal: {
    name: 'Minimalista',
    primaryColor: '#374151',
    secondaryColor: '#4b5563',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    headerHeight: 35,
    footerHeight: 25,
    margins: { top: 15, bottom: 15, left: 15, right: 15 },
  },
};

export class PDFGenerator {
  private doc: jsPDF;
  private template: PDFTemplate;
  private pageWidth: number;
  private pageHeight: number;
  private currentY: number;

  constructor(template: string = 'classic') {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.template = templates[template] || templates.classic;
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.currentY = this.template.margins.top;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  }

  private setColor(color: string): void {
    const rgb = this.hexToRgb(color);
    this.doc.setTextColor(rgb.r, rgb.g, rgb.b);
  }

  private setFillColor(color: string): void {
    const rgb = this.hexToRgb(color);
    this.doc.setFillColor(rgb.r, rgb.g, rgb.b);
  }

  private addHeader(title: string): void {
    // Fundo do header
    this.setFillColor(this.template.primaryColor);
    this.doc.rect(0, 0, this.pageWidth, this.template.headerHeight, 'F');

    // Logo/Título
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.setColor('#ffffff');
    this.doc.text('RESERVEI VIAGENS', this.template.margins.left, 15);

    // Subtítulo
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(title, this.template.margins.left, 25);

    // Data de emissão
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');
    this.doc.setFontSize(10);
    this.doc.text(`Emitido em: ${dateStr}`, this.pageWidth - this.template.margins.right - 50, 15);

    this.currentY = this.template.headerHeight + 10;
  }

  private addFooter(): void {
    const footerY = this.pageHeight - this.template.footerHeight;
    
    // Linha separadora
    this.setColor(this.template.secondaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.template.margins.left, footerY, this.pageWidth - this.template.margins.right, footerY);

    // Texto do footer
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.setColor(this.template.textColor);
    
    const footerText = 'Este voucher é válido mediante apresentação de documento de identidade.';
    this.doc.text(footerText, this.template.margins.left, footerY + 10);
    
    const contactText = 'Contato: contato@reservei.com | (11) 99999-9999';
    this.doc.text(contactText, this.template.margins.left, footerY + 20);

    // Número da página
    this.doc.text(`Página 1 de 1`, this.pageWidth - this.template.margins.right - 20, footerY + 10);
  }

  private addSection(title: string, content: string[]): void {
    // Título da seção
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.setColor(this.template.primaryColor);
    this.doc.text(title, this.template.margins.left, this.currentY);
    this.currentY += 8;

    // Conteúdo
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.setColor(this.template.textColor);

    content.forEach((line) => {
      this.doc.text(line, this.template.margins.left, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 5;
  }

  private async addQRCode(data: string): Promise<void> {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        width: 200,
        margin: 2,
        color: {
          dark: this.template.textColor,
          light: '#ffffff',
        },
      });

      // Adicionar QR Code no canto superior direito
      const qrSize = 40;
      const qrX = this.pageWidth - this.template.margins.right - qrSize;
      const qrY = this.template.headerHeight + 10;

      this.doc.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSize, qrSize);

      // Texto explicativo
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.setColor(this.template.textColor);
      this.doc.text('Escaneie o QR Code', qrX, qrY + qrSize + 5);
      this.doc.text('para validar', qrX, qrY + qrSize + 10);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    }
  }

  public async generateHotelVoucher(data: VoucherData): Promise<Uint8Array> {
    this.addHeader('VOUCHER DE HOTEL');
    await this.addQRCode(data.qrCodeData);

    this.addSection('INFORMAÇÕES DO HÓSPEDE', [
      `Nome: ${data.customerName}`,
      `Email: ${data.customerEmail}`,
      `Telefone: ${data.customerPhone || 'Não informado'}`,
      `Reserva: ${data.reservationNumber}`,
    ]);

    this.addSection('DETALHES DA RESERVA', [
      `Hotel: ${data.hotelName}`,
      `Check-in: ${data.checkIn}`,
      `Check-out: ${data.checkOut}`,
      `Adultos: ${data.adults}`,
      `Crianças: ${data.children || 0}`,
      `Bebês: ${data.babies || 0}`,
      `Valor Total: R$ ${data.totalPrice.toFixed(2)}`,
      `Status: ${data.paymentStatus}`,
    ]);

    if (data.specialRequests) {
      this.addSection('SOLICITAÇÕES ESPECIAIS', [data.specialRequests]);
    }

    if (data.terms && data.terms.length > 0) {
      this.addSection('TERMOS E CONDIÇÕES', data.terms);
    }

    this.addFooter();
    
    const arrayBuffer = this.doc.output('arraybuffer');
    return new Uint8Array(arrayBuffer);
  }

  public async generateTicketVoucher(data: VoucherData): Promise<Uint8Array> {
    this.addHeader('VOUCHER DE INGRESSO');
    await this.addQRCode(data.qrCodeData);

    this.addSection('INFORMAÇÕES DO VISITANTE', [
      `Nome: ${data.customerName}`,
      `Email: ${data.customerEmail}`,
      `Telefone: ${data.customerPhone || 'Não informado'}`,
      `Reserva: ${data.reservationNumber}`,
    ]);

    this.addSection('DETALHES DO INGRESSO', [
      `Evento: ${data.ticketName}`,
      `Data: ${data.eventDate}`,
      `Horário: ${data.eventTime}`,
      `Adultos: ${data.adults}`,
      `Crianças: ${data.children || 0}`,
      `Bebês: ${data.babies || 0}`,
      `Valor Total: R$ ${data.totalPrice.toFixed(2)}`,
      `Status: ${data.paymentStatus}`,
    ]);

    if (data.validUntil) {
      this.addSection('VALIDADE', [`Válido até: ${data.validUntil}`]);
    }

    if (data.terms && data.terms.length > 0) {
      this.addSection('TERMOS E CONDIÇÕES', data.terms);
    }

    this.addFooter();
    
    const arrayBuffer = this.doc.output('arraybuffer');
    return new Uint8Array(arrayBuffer);
  }

  public async generateAttractionVoucher(data: VoucherData): Promise<Uint8Array> {
    this.addHeader('VOUCHER DE ATRAÇÃO');
    await this.addQRCode(data.qrCodeData);

    this.addSection('INFORMAÇÕES DO VISITANTE', [
      `Nome: ${data.customerName}`,
      `Email: ${data.customerEmail}`,
      `Telefone: ${data.customerPhone || 'Não informado'}`,
      `Reserva: ${data.reservationNumber}`,
    ]);

    this.addSection('DETALHES DA ATRAÇÃO', [
      `Atração: ${data.attractionName}`,
      `Data: ${data.eventDate}`,
      `Horário: ${data.eventTime}`,
      `Adultos: ${data.adults}`,
      `Crianças: ${data.children || 0}`,
      `Bebês: ${data.babies || 0}`,
      `Valor Total: R$ ${data.totalPrice.toFixed(2)}`,
      `Status: ${data.paymentStatus}`,
    ]);

    if (data.validUntil) {
      this.addSection('VALIDADE', [`Válido até: ${data.validUntil}`]);
    }

    if (data.terms && data.terms.length > 0) {
      this.addSection('TERMOS E CONDIÇÕES', data.terms);
    }

    this.addFooter();
    
    const arrayBuffer = this.doc.output('arraybuffer');
    return new Uint8Array(arrayBuffer);
  }
}

export async function generateVoucher(
  data: VoucherData,
  template: string = 'classic'
): Promise<Uint8Array> {
  const generator = new PDFGenerator(template);

  switch (data.type) {
    case 'hotel':
      return await generator.generateHotelVoucher(data);
    case 'ticket':
      return await generator.generateTicketVoucher(data);
    case 'attraction':
      return await generator.generateAttractionVoucher(data);
    default:
      throw new Error(`Tipo de voucher não suportado: ${data.type}`);
  }
} 