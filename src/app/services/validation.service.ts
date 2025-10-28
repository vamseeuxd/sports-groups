import { Injectable } from '@angular/core';
import { APP_CONSTANTS } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  
  isDuplicateName(name: string, items: { name: string; id?: string }[], excludeId?: string): boolean {
    return items.some(item => 
      item.id !== excludeId && 
      item.name.toLowerCase() === name.toLowerCase()
    );
  }

  isValidGroupName(name: string): boolean {
    const trimmed = name.trim();
    return trimmed.length >= APP_CONSTANTS.VALIDATION.GROUP_NAME_MIN_LENGTH && 
           trimmed.length <= APP_CONSTANTS.VALIDATION.GROUP_NAME_MAX_LENGTH;
  }

  sanitizeInput(input: string): string {
    return input.trim();
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  isValidMobileNumber(mobile: string): boolean {
    const mobileRegex = /^[+]?[0-9]{10,15}$/;
    return mobileRegex.test(mobile.replace(/\s/g, ''));
  }

  isValidPlayerName(name: string): boolean {
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 50 && /^[a-zA-Z\s]+$/.test(trimmed);
  }

  validatePlayerRegistration(data: { playerName: string; playerEmail: string; mobileNumber: string; gender: string }): string[] {
    const errors: string[] = [];
    
    if (!this.isValidPlayerName(data.playerName)) {
      errors.push('Player name must be 2-50 characters and contain only letters and spaces');
    }
    
    if (!this.isValidEmail(data.playerEmail)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!this.isValidMobileNumber(data.mobileNumber)) {
      errors.push('Mobile number must be 10-15 digits');
    }
    
    if (!['male', 'female', 'other'].includes(data.gender)) {
      errors.push('Please select a valid gender');
    }
    
    return errors;
  }

  validateCSVData(csvData: any[]): { valid: boolean; errors: string[]; validRows: any[] } {
    const errors: string[] = [];
    const validRows: any[] = [];
    const requiredHeaders = ['playerName', 'playerEmail', 'gender', 'mobileNumber'];
    
    if (csvData.length === 0) {
      errors.push('CSV file is empty');
      return { valid: false, errors, validRows };
    }
    
    // Check headers
    const headers = Object.keys(csvData[0]);
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
      errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
      return { valid: false, errors, validRows };
    }
    
    // Validate each row
    csvData.forEach((row, index) => {
      const rowErrors = this.validatePlayerRegistration({
        playerName: row.playerName || '',
        playerEmail: row.playerEmail || '',
        mobileNumber: row.mobileNumber || '',
        gender: row.gender || ''
      });
      
      if (rowErrors.length > 0) {
        errors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
      } else {
        validRows.push(row);
      }
    });
    
    return { valid: errors.length === 0, errors, validRows };
  }

  parseCSV(csvText: string): any[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
    
    return data;
  }
}