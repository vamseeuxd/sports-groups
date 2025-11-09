export class DateUtils {
  static formatDateForDisplay(date: any): Date {
    if (date && date.toDate) {
      return date.toDate();
    }
    return new Date(date);
  }

  static formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  static getFormattedDate(date: any): string {
    if (!date) return '';
    try {
      let jsDate: Date;
      if (date.toDate && typeof date.toDate === 'function') {
        jsDate = date.toDate();
      } else if (date instanceof Date) {
        jsDate = date;
      } else {
        jsDate = new Date(date);
      }
      return jsDate.toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  }
}