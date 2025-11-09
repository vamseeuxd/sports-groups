export class StatusUtils {
  static getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'text-bg-danger';
      case 'in-progress':
        return 'text-bg-warning';
      case 'completed':
        return 'text-bg-success';
      case 'approved':
        return 'text-bg-success';
      case 'rejected':
        return 'text-bg-danger';
      default:
        return 'text-bg-secondary';
    }
  }
}