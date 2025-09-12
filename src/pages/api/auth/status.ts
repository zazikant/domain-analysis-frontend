/**
 * Next.js API Route: Check User Access Status
 * GET /api/auth/status?email=user@example.com
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { BigQuery } from '@google-cloud/bigquery';

// Types
interface UserStatus {
  email: string;
  access_status: 'Pending' | 'Granted' | 'Denied';
  name: string;
  login_count: number;
  last_login: string;
}

let bigQueryClient: BigQuery | null = null;

const initializeBigQuery = () => {
  if (!bigQueryClient) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');
      bigQueryClient = new BigQuery({
        projectId: process.env.GCP_PROJECT_ID,
        credentials
      });
    } catch (error) {
      console.error('Failed to initialize BigQuery:', error);
    }
  }
};

const getUserStatus = async (email: string): Promise<UserStatus | null> => {
  if (!bigQueryClient) {
    throw new Error('BigQuery client not initialized');
  }

  const projectId = process.env.GCP_PROJECT_ID;
  const dataset = 'advanced_csv_analysis';
  const table = 'users';

  try {
    const [rows] = await bigQueryClient.query({
      query: `
        SELECT 
          email,
          name,
          access_status,
          login_count,
          last_login
        FROM \`${projectId}.${dataset}.${table}\`
        WHERE email = @email
        LIMIT 1
      `,
      params: { email }
    });

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as UserStatus;
  } catch (error) {
    console.error('Status check error:', error);
    throw new Error('Status check failed');
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    initializeBigQuery();
    
    const { email } = req.query;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email parameter required' });
    }

    const user = await getUserStatus(email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      email: user.email,
      access_status: user.access_status,
      name: user.name,
      login_count: user.login_count,
      last_login: user.last_login
    });

  } catch (error) {
    console.error('API error:', error);
    
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Status check failed' 
    });
  }
}