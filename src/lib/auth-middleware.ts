/**
 * Authentication middleware utilities for protecting API routes
 * Provides role-based access control for admin and user endpoints
 */

import { auth } from '@/auth';
import { NextResponse } from 'next/server';

/**
 * Require authenticated user (any role)
 * Throws 401 error if not authenticated
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Authentication required');
  }

  return session.user;
}

/**
 * Require admin role
 * Throws 401/403 error if not authenticated or not admin
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Authentication required');
  }

  if (session.user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return session.user;
}

/**
 * Wrapper for API routes that require admin access
 * Returns proper error responses with status codes
 */
export function withAdmin<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      await requireAdmin();
      return await handler(...args);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unauthorized';

      if (message === 'Authentication required') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      if (message === 'Admin access required') {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }) as T;
}

/**
 * Wrapper for API routes that require any authenticated user
 * Returns proper error responses with status codes
 */
export function withAuth<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      await requireAuth();
      return await handler(...args);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unauthorized';

      if (message === 'Authentication required') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }) as T;
}
