import type { Order, MenuItem, TPVConfig, TPVType } from '../../types';
import { RevoAdapter } from './adapters/revo.adapter';
import { LightspeedAdapter } from './adapters/lightspeed.adapter';
import { SquareAdapter } from './adapters/square.adapter';

export interface TPVAdapter {
  name: string;
  syncMenu(): Promise<MenuItem[]>;
  sendOrder(order: Order): Promise<string>;
  getOrderStatus(tpvOrderId: string): Promise<string>;
  cancelOrder(tpvOrderId: string): Promise<boolean>;
}

export class TPVService {
  private adapter: TPVAdapter | null = null;

  constructor(config: TPVConfig) {
    if (!config.enabled) return;

    switch (config.type) {
      case 'revo':
        this.adapter = new RevoAdapter(config.credentials);
        break;
      case 'lightspeed':
        this.adapter = new LightspeedAdapter(config.credentials);
        break;
      case 'square':
        this.adapter = new SquareAdapter(config.credentials);
        break;
      default:
        this.adapter = null;
    }
  }

  async syncMenu(): Promise<MenuItem[]> {
    if (!this.adapter) throw new Error('TPV adapter not configured');
    return this.adapter.syncMenu();
  }

  async sendOrder(order: Order): Promise<string> {
    if (!this.adapter) throw new Error('TPV adapter not configured');
    return this.adapter.sendOrder(order);
  }

  async getOrderStatus(tpvOrderId: string): Promise<string> {
    if (!this.adapter) throw new Error('TPV adapter not configured');
    return this.adapter.getOrderStatus(tpvOrderId);
  }

  async cancelOrder(tpvOrderId: string): Promise<boolean> {
    if (!this.adapter) throw new Error('TPV adapter not configured');
    return this.adapter.cancelOrder(tpvOrderId);
  }
}

// Example of a specific adapter implementation (Revo)
// In a real scenario, these would be in separate files
export class RevoAdapter implements TPVAdapter {
  name = 'Revo XEF';
  private apiKey: string;

  constructor(credentials: any) {
    this.apiKey = credentials.apiKey;
  }

  async syncMenu(): Promise<MenuItem[]> {
    console.log('Syncing menu from Revo...');
    // Implementation of Revo API call
    return [];
  }

  async sendOrder(order: Order): Promise<string> {
    console.log('Sending order to Revo:', order.id);
    // Implementation of Revo API call
    return 'revo-order-id-123';
  }

  async getOrderStatus(tpvOrderId: string): Promise<string> {
    return 'preparing';
  }

  async cancelOrder(tpvOrderId: string): Promise<boolean> {
    return true;
  }
}
