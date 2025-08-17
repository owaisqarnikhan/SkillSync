// Simple in-memory storage for development
export class MemStorage {
  private data = new Map<string, any[]>();

  constructor() {
    // Initialize empty collections for all entities
    this.data.set('users', []);
    this.data.set('countries', []);
    this.data.set('sports', []);
    this.data.set('teams', []);
    this.data.set('venueTypes', []);
    this.data.set('venues', []);
    this.data.set('bookings', []);
    this.data.set('venueBlackouts', []);
    this.data.set('notifications', []);
    this.data.set('auditLogs', []);
    this.data.set('systemConfig', []);
    this.data.set('dashboardPermissions', []);
  }

  getCollection(name: string) {
    if (!this.data.has(name)) {
      this.data.set(name, []);
    }
    return this.data.get(name)!;
  }

  insert(collection: string, item: any) {
    const items = this.getCollection(collection);
    const id = item.id || this.generateId();
    const newItem = { ...item, id, createdAt: new Date(), updatedAt: new Date() };
    items.push(newItem);
    return newItem;
  }

  findById(collection: string, id: string) {
    const items = this.getCollection(collection);
    return items.find(item => item.id === id);
  }

  findBy(collection: string, filter: (item: any) => boolean) {
    const items = this.getCollection(collection);
    return items.filter(filter);
  }

  update(collection: string, id: string, updates: any) {
    const items = this.getCollection(collection);
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates, updatedAt: new Date() };
      return items[index];
    }
    throw new Error(`Item with id ${id} not found in ${collection}`);
  }

  delete(collection: string, id: string) {
    const items = this.getCollection(collection);
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items.splice(index, 1);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

// Export a single instance for the application to use
export const memStorage = new MemStorage();