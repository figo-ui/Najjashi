export class SupabaseConnector {
  private channel: any = null;

  constructor(private supabase: any) {}

  async connect() {
    if (!this.supabase) return;
    this.channel = this.supabase.channel('db-changes');
    await this.channel.subscribe();
  }

  async disconnect() {
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }
  }
}
