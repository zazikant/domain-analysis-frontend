/**
 * Next.js API Route: User Registration via Google OAuth
 * POST /api/auth/register
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { BigQuery } from '@google-cloud/bigquery';
import { OAuth2Client } from 'google-auth-library';

// Types
interface User {
  email: string;
  name: string;
  profile_picture: string;
  access_status: 'Pending' | 'Granted' | 'Denied';
  login_count: number;
  existing_user: boolean;
}

// Initialize clients
let bigQueryClient: BigQuery | null = null;
let oauth2Client: OAuth2Client | null = null;

const initializeClients = () => {
  if (!bigQueryClient) {
    try {
      // Initialize BigQuery with service account JSON from environment variable
      const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');
      bigQueryClient = new BigQuery({
        projectId: process.env.GCP_PROJECT_ID,
        credentials
      });
    } catch (error) {
      console.error('Failed to initialize BigQuery:', error);
    }
  }
  
  if (!oauth2Client) {
    oauth2Client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  }
};

const verifyGoogleToken = async (token: string) => {
  if (!oauth2Client) {
    throw new Error('OAuth client not initialized');
  }
  
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: token,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    throw new Error('Invalid token');
  }
};

const registerUser = async (email: string, name: string, profilePicture: string): Promise<User> => {
  if (!bigQueryClient) {
    throw new Error('BigQuery client not initialized');
  }

  const projectId = process.env.GCP_PROJECT_ID;
  const dataset = 'advanced_csv_analysis';
  const table = 'users';

  try {
    // Check if user exists
    const [existingUsers] = await bigQueryClient.query({
      query: `
        SELECT * FROM \`${projectId}.${dataset}.${table}\`
        WHERE email = @email
        LIMIT 1
      `,
      params: { email }
    });

    if (existingUsers.length > 0) {
      // Update last login
      await bigQueryClient.query({
        query: `
          UPDATE \`${projectId}.${dataset}.${table}\`
          SET 
            last_login = CURRENT_TIMESTAMP(),
            login_count = COALESCE(login_count, 0) + 1,
            updated_at = CURRENT_TIMESTAMP()
          WHERE email = @email
        `,
        params: { email }
      });

      return {
        email,
        name: existingUsers[0].name || name,
        profile_picture: existingUsers[0].profile_picture || profilePicture,
        access_status: existingUsers[0].access_status as 'Pending' | 'Granted' | 'Denied',
        login_count: (existingUsers[0].login_count || 0) + 1,
        existing_user: true
      };
    } else {
      // Create new user
      const userData = {
        email,
        name: name || '',
        profile_picture: profilePicture || '',
        access_status: 'Pending',
        first_login: new Date().toISOString(),
        last_login: new Date().toISOString(),
        login_count: 1,
        created_by_admin: null,
        notes: 'Auto-registered via Google OAuth',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const datasetRef = bigQueryClient.dataset(dataset);
      const tableRef = datasetRef.table(table);
      await tableRef.insert([userData]);

      return {
        email,
        name,
        profile_picture: profilePicture,
        access_status: 'Pending',
        login_count: 1,
        existing_user: false
      };
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error('Registration failed');
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    initializeClients();
    
    const { email, name, profile_picture, google_token } = req.body;

    if (!email || !google_token) {
      return res.status(400).json({ error: 'Email and google_token are required' });
    }

    // Verify Google token
    const userInfo = await verifyGoogleToken(google_token);
    
    if (userInfo?.email !== email) {
      return res.status(400).json({ error: 'Email mismatch' });
    }

    // Register user
    const result = await registerUser(email, name || userInfo?.name || '', profile_picture || userInfo?.picture || '');

    return res.status(200).json(result);

  } catch (error) {
    console.error('API error:', error);
    
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Registration failed' 
    });
  }
}