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
}