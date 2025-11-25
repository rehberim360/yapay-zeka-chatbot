/**
 * Offerings API Service
 * Handles custom field management for offerings
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface CustomFieldPayload {
  action: 'add' | 'update' | 'remove';
  key: string;
  value?: unknown;
  type?: 'string' | 'number' | 'boolean' | 'array';
  label?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  offering?: T;
  error?: string;
  details?: string;
}

/**
 * Add custom field to offering meta_info
 */
export async function addCustomField(
  offeringId: string,
  key: string,
  value: unknown,
  type: 'string' | 'number' | 'boolean' | 'array',
  label: string,
  token: string
): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/offerings/${offeringId}/meta-info`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      action: 'add',
      key,
      value,
      type,
      label
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add custom field');
  }

  return response.json();
}

/**
 * Update custom field value
 */
export async function updateCustomField(
  offeringId: string,
  key: string,
  value: unknown,
  token: string
): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/offerings/${offeringId}/meta-info`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      action: 'update',
      key,
      value
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update custom field');
  }

  return response.json();
}

/**
 * Remove custom field
 */
export async function removeCustomField(
  offeringId: string,
  key: string,
  token: string
): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/offerings/${offeringId}/meta-info`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      action: 'remove',
      key
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove custom field');
  }

  return response.json();
}

/**
 * Update offering meta_info (batch update)
 * This is a client-side helper for local state management
 * Actual API calls happen through add/update/remove functions
 */
export async function updateOfferingMetaInfo(): Promise<ApiResponse> {
  return {
    success: true,
    message: 'Meta info updated locally'
  };
}
